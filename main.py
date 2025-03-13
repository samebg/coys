from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
from datetime import datetime
from typing import List, Optional
import json
import os

class Match:
    def __init__(self, opponent: str, competition: str, match_time: datetime, is_home: bool):
        self.opponent = opponent
        self.competition = competition
        self.match_time = match_time
        self.is_home = is_home

    def to_dict(self):
        return {
            'opponent': self.opponent,
            'competition': self.competition,
            'match_time': self.match_time.strftime('%Y-%m-%d %H:%M'),
            'location': 'home' if self.is_home else 'away'
        }

class MatchTracker:
    def __init__(self):
        self.matches: List[Match] = []
        self.subscribers: List[dict] = []
        self._add_sample_matches()

    def _add_sample_matches(self):
        sample_matches = [
            Match("Arsenal", "Premier League", 
                  datetime(2025, 3, 2, 15, 30), True),
            Match("Manchester United", "FA Cup", 
                  datetime(2025, 3, 16, 20, 0), False),
            Match("Liverpool", "Premier League", 
                  datetime(2025, 3, 30, 16, 0), True)
        ]
        self.matches.extend(sample_matches)

    def get_next_match(self) -> Optional[Match]:
        now = datetime.now()
        future_matches = [m for m in self.matches if m.match_time > now]
        return min(future_matches, key=lambda m: m.match_time) if future_matches else None

    def add_subscriber(self, email: Optional[str] = None, phone: Optional[str] = None) -> bool:
        if not email and not phone:
            return False
        self.subscribers.append({
            'email': email,
            'phone': phone,
            'subscribed_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        return True

    def list_all_matches(self) -> List[Match]:
        return sorted(self.matches, key=lambda m: m.match_time)

class RequestHandler(BaseHTTPRequestHandler):
    def _send_response(self, content, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(content.encode())

    def do_GET(self):
        tracker = MatchTracker()
        next_match = tracker.get_next_match()
        all_matches = tracker.list_all_matches()
        
        with open('templates/index.html', 'r') as f:
            template = f.read()
            
        matches_html = ''
        for match in all_matches:
            match_dict = match.to_dict()
            matches_html += f'''
                <div class="border-b pb-4 last:border-b-0">
                    <p class="text-lg font-semibold">vs {match_dict['opponent']}</p>
                    <p>{match_dict['competition']}</p>
                    <p>{match_dict['match_time']} ({match_dict['location']})</p>
                </div>
            '''

        next_match_html = ''
        if next_match:
            match_dict = next_match.to_dict()
            next_match_html = f'''
                <div class="space-y-2">
                    <p class="text-xl">{match_dict['opponent']}</p>
                    <p>Competition: {match_dict['competition']}</p>
                    <p>Date: {match_dict['match_time']}</p>
                    <p>Location: {match_dict['location']}</p>
                </div>
            '''
        else:
            next_match_html = '<p>No upcoming matches scheduled</p>'

        content = template.replace('{{ next_match_content }}', next_match_html)
        content = content.replace('{{ matches_content }}', matches_html)
        
        self._send_response(content)

    def do_POST(self):
        if self.path == '/subscribe':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length).decode('utf-8')
            form_data = parse_qs(post_data)
            
            email = form_data.get('email', [''])[0].strip()
            phone = form_data.get('phone', [''])[0].strip()
            
            tracker = MatchTracker()
            success = tracker.add_subscriber(email=email or None, phone=phone or None)
            
            if success:
                self.send_response(302)
                self.send_header('Location', '/')
                self.end_headers()
            else:
                self._send_response('Please provide either email or phone number', 400)

def run(server_class=HTTPServer, handler_class=RequestHandler, port=5000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
from html.parser import HTMLParser
import pathlib
text = pathlib.Path('index.html').read_text(encoding='utf-8')

class TagChecker(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        self.voids = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def handle_starttag(self, tag, attrs):
        if tag not in self.voids:
            self.stack.append((tag, self.getpos()))
    def handle_endtag(self, tag):
        if not self.stack:
            self.errors.append(f'Unmatched </{tag}> at {self.getpos()}')
            return
        last, pos = self.stack.pop()
        if last != tag:
            self.errors.append(f'Expected </{last}> but found </{tag}> at {self.getpos()}')
    def close(self):
        super().close()
        if self.stack:
            for tag, pos in self.stack:
                self.errors.append(f'Unclosed <{tag}> opened at {pos}')

parser = TagChecker()
parser.feed(text)
parser.close()
if parser.errors:
    print('\n'.join(parser.errors))
else:
    print('OK')

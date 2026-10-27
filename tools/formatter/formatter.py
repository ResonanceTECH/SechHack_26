import os
import re
import subprocess
from typing import Union

# --trace
# --toc
# --toc-depth=3
# --template=assets/toc.tex

class PandocFormatter:
    def __init__(self, base_path: str, exclude: Union[None, str] = None):
        self.base_path = base_path
        self.exclude = exclude
        self.match_md = []

    def _generator_(self, template_in: str, template_out: str) -> Union[bool, Exception]:
        try:
            filespath = os.path.join(self.base_path, '_files.txt')
            with open(filespath, 'w', encoding='utf-8') as file:
                for filename in sorted(os.listdir(self.base_path)):
                    excl_match = None
                    if self.exclude: excl_match = re.match(pattern=self.exclude, string=filename, flags=re.IGNORECASE)
                    if not excl_match and filename.lower().endswith('.md'):
                        self.match_md.append(filename)
                        file.write(filename + '\n')
                        # печатать команду для каждого MD файла
                        # print(f'{template_in}{filename} -o out/{filename.replace(".md", ".pdf")}')
            command = f'{template_in}{" ".join(self.match_md)}{template_out}'
            print(command)
            result = subprocess.run(command, shell=True, cwd=self.base_path, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            print(f'\tstderr:\n{result.stderr}')
            print(f'\tstdout:\n{result.stdout}')
            # return result
            if result.returncode == 0: return True
            else: raise Exception(f'Error: {result.stderr}')
        except Exception as e: return e


    def gen_pdf(self) -> Union[object, Exception]:
        template_in = 'pandoc -f markdown --pdf-engine=xelatex --number-sections --toc --toc-depth=3 --lua-filter=assets/page_break.lua -s '
        template_out = ' -o out/out.pdf -V mainfont="Times New Roman"'
        self._generator_(template_in, template_out)
        return os.path.join(self.base_path, 'out', 'out.pdf')

    def gen_docx(self) -> Union[object, Exception]:        
        template_in = 'pandoc -f markdown --number-sections --toc --toc-depth=3 --reference-doc=assets/reference.docx --lua-filter=assets/page_break.lua -s '
        template_out = ' -o out/out.docx'
        self._generator_(template_in, template_out)
        return os.path.join(self.base_path, 'out', 'out.docx')
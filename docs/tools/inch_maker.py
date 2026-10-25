import os
import cv2


PATH = '../media'
INCH_W = 6.5


def inch_maker(path: str, inch_w: float) -> str:
    '''
    Программа берет картинки из папки media и формирует по каждой
    параметризованную строку для вставки в MD файл и отображения изображений
    с определенными размерами в дюймах.
    
    Значение ширины задается параметром inch_w.
    Высота пересчитывается на основе этого параметра с соблюдением соотношения сторон.
    '''
    template = '![{}](./media/{}){{width="{:.2f}in" height="{:.2f}in"}}  '

    for file_name in os.listdir(PATH):
        if file_name.endswith(('.jpeg', '.jpg', '.png')):
            img = cv2.imread('{}/{}'.format(path, file_name))

            h, w = img.shape[:2]
            print(template.format(file_name.split('.')[0], file_name, round(inch_w, 2), round(inch_w * (h / w), 2)))


if __name__ == "__main__": inch_maker(PATH, INCH_W)
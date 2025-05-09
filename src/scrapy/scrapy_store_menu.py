import os
import requests
from bs4 import BeautifulSoup
import json
from pdf2image import convert_from_bytes
import argparse
import urllib3

## 爬pdf會有警告。所以關閉
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def get_output_path(store, ext):
    """指令圖片匯出目錄，要從根目錄執行才可以 ex: ./src./scrapy/scrapy_store_menu.py"""
    base_dir = os.path.dirname(os.path.abspath(__file__))  # 取得目前 .py 檔案路徑
    root_dir = os.path.abspath(os.path.join(base_dir, '..', '..'))  # 回到專案根目錄
    if ext =='':
        return os.path.join(root_dir, 'src', 'assets', 'images', 'storeMenus', f'{store}')
    else :
        return os.path.join(root_dir, 'src','assets', 'images', 'storeMenus', f'{store}{ext}')

def load_store_dict():
    """取得本地商家和網址的對應字典"""
    base_dir = os.path.dirname(os.path.abspath(__file__))  # 取得當前 .py 檔案的資料夾
    path = os.path.join(base_dir, 'storeAndUrl.json')
    with open(path, "r", encoding="utf-8") as f:
        store_and_url_ary = json.load(f)
    return {item["store"]: item["url"] for item in store_and_url_ary}


def get_image_url(store: str, soup: BeautifulSoup) -> str:
    """根據不同商家抓取圖片 URL"""
    if store == '19':
        tag = soup.find('a', class_='_clip_slider__link')
        return tag.get('href') if tag else ''
    elif store == 'comebuy':
        tag = soup.find('div', class_='tabContentItem')
        tag = tag.find('img')
        return tag.get('src') if tag else ''
    elif store == 'teatop':
        tag = soup.find('div', class_='textEditor')
        tag = tag.find('img')
        return tag.get('src') if tag else ''
    elif store == '五桐號':
        tag = soup.find('div', class_='desktopArea')
        tag = tag.find('img')
        return tag.get('src') if tag else ''
    elif store == '大苑子':
        tag = soup.find('picture', class_='skip-lazy')
        tag = tag.find('img')
        return 'https:' + tag.get('src') if tag else ''
    elif store == '珍煮丹':
        tag = soup.find('a', class_='fancybox-menu')
        return 'https://www.truedan.com.tw/' + tag.get('href') if tag else ''
    elif store == '萬波':
        tag = soup.find('img', src='images/menu-y-1.svg')
        tag = tag.find_parent('a')
        return 'https://wanpotea.com/' + tag.get('href') if tag else ''
    elif store == '阿義':
        tag = soup.find('div', class_='ayd01_a02')
        tag = tag.find('a')
        return tag.get('href') if tag else ''
    elif store == '麻古':
        tag = soup.find_all('nav', class_='menuListSub')
        tag = tag[1].find('a')
        return 'https://www.macutea.com.tw/' + tag.get('href') if tag else ''
    return ''

def get_file_extension(url: str) -> str:
    """取得圖片檔案的副檔名"""
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    return ext if ext in ['.jpg', '.jpeg', '.png', '.webp'] else '.jpg'


def download_image(img_url: str, save_path: str):
    """下載圖片到指定路徑"""
    try:
        img_data = requests.get(img_url).content
        with open(save_path, 'wb') as f:
            f.write(img_data)
        print(f'已下載：{save_path}')
    except Exception as e:
        print(f'無法下載 {img_url}：{e}')


def convert_pdf_to_image(pdf_data: bytes, page_number: int, output_image_path: str):
    """將 PDF 的特定頁面轉換為圖片"""
    images = convert_from_bytes(pdf_data, first_page=page_number, last_page=page_number)
    if images:
        image = images[0]
        image.save(output_image_path, 'JPEG')
        print(f"圖片已儲存至: {output_image_path}")
    else:
        print("無法提取該頁面作為圖片")

def download_images_from_url(store: str):
    """爬蟲主程式"""
    store_dict = load_store_dict()
    store_url = store_dict.get(store)

    if not store_url:
        print(f'找不到商家 {store} 的網址')
        return None
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    }
    verify = True
    if store == '可不可' or store == '迷客夏':
        verify = False
    try:
        response = requests.get(store_url, headers=headers, verify=verify)
        response.raise_for_status()
    except Exception as e:
        print(f'無法連線到 {store_url}：{e}')
        return None

    soup = BeautifulSoup(response.text, 'html.parser')
    if store == '可不可':
        tag = soup.find('div', class_='page-menu__download')
        tag = tag.find('a')
        url = tag.get('href')
        response = requests.get(url, headers=headers, verify=verify)
        response.raise_for_status()
        convert_pdf_to_image(response.content, 2,get_output_path(f'{store}.jpg', ''))
        return None
    elif store == '迷客夏':
        tag = soup.find('div', class_='about_list')
        tag = tag.find('a')
        url = 'https://www.milksha.com/' + tag.get('href')
        response = requests.get(url, headers=headers, verify=verify)
        response.raise_for_status()
        convert_pdf_to_image(response.content, 1,get_output_path(f'{store}.jpg', ''))
        return None
    else:
        img_url = get_image_url(store, soup)
        if not img_url:
            print(f'商家 {store} 沒有找到圖片 URL')
            return None

        ext = get_file_extension(img_url)
        filename = get_output_path(store, ext)
        download_image(img_url, filename)
        return None

def main():
    # 使用 argparse 解析命令行參數，範例: python ./src./scrapy/scrapy_store_menu.py comebuy
    parser = argparse.ArgumentParser(description="下載商家圖片")
    parser.add_argument('store', type=str, help="商家編號")
    args = parser.parse_args()
    download_images_from_url(args.store)

if __name__ == '__main__':
    main()

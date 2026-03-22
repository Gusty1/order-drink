"""
飲料店菜單爬蟲
根據 storeAndUrl.json 中的商家和 URL，自動抓取各店家的菜單圖片。
支援 HTML 頁面圖片擷取和 PDF 轉圖片兩種模式。
"""

import os
import json
import argparse
import requests
import urllib3
from bs4 import BeautifulSoup
from pdf2image import convert_from_bytes

# 部分店家的 SSL 憑證有問題，關閉警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/136.0.0.0 Safari/537.36"
    )
}

# 需要關閉 SSL 驗證的店家清單
SSL_SKIP_STORES = {'可不可', '迷客夏', '鮮茶道'}


def get_output_path(store, ext=''):
    """
    取得圖片匯出的完整路徑。
    :param store: 商家名稱
    :param ext: 副檔名（含點號，例如 '.jpg'），若為空則不加副檔名
    :return: 完整檔案路徑
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(base_dir, '..', '..'))
    return os.path.join(root_dir, 'src', 'assets', 'images', 'storeMenus', f'{store}{ext}')


def load_store_dict():
    """讀取 storeAndUrl.json，回傳 {商家名稱: URL} 字典"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, 'storeAndUrl.json')
    with open(path, "r", encoding="utf-8") as f:
        store_and_url_ary = json.load(f)
    return {item["store"]: item["url"] for item in store_and_url_ary}


def safe_find(tag, *args, **kwargs):
    """安全的 BeautifulSoup find，避免 None 上呼叫 find 導致 AttributeError"""
    if tag is None:
        return None
    return tag.find(*args, **kwargs)


def safe_find_parent(tag, *args, **kwargs):
    """安全的 find_parent"""
    if tag is None:
        return None
    return tag.find_parent(*args, **kwargs)


def safe_get(tag, attr):
    """安全取得 tag 的屬性值"""
    if tag is None:
        return ''
    return tag.get(attr, '')


def get_image_url(store, soup):
    """
    根據不同商家的 HTML 結構，抓取菜單圖片 URL。
    每家店的網頁結構不同，需要各自處理。
    :return: 圖片 URL 字串，找不到則回傳空字串
    """
    # 各店家圖片擷取策略
    strategies = {
        '19': lambda s: safe_get(s.find('a', class_='_clip_slider__link'), 'href'),
        'comebuy': lambda s: safe_get(safe_find(s.find('div', class_='tabContentItem'), 'img'), 'src'),
        'teatop': lambda s: safe_get(safe_find(s.find('div', class_='textEditor'), 'img'), 'src'),
        '五桐號': lambda s: safe_get(safe_find(s.find('div', class_='desktopArea'), 'img'), 'src'),
        '大苑子': lambda s: _prefix('https:', safe_get(safe_find(s.find('picture', class_='skip-lazy'), 'img'), 'src')),
        '珍煮丹': lambda s: _prefix('https://www.truedan.com.tw/', safe_get(s.find('a', class_='fancybox-menu'), 'href')),
        '萬波': lambda s: _prefix('https://wanpotea.com/', safe_get(safe_find_parent(s.find('img', src='images/menu-y-1.svg'), 'a'), 'href')),
        '阿義': lambda s: safe_get(safe_find(s.find('div', class_='ayd01_a02'), 'a'), 'href'),
        '麻古': lambda s: _get_macu_url(s),
        '清原': lambda s: safe_get(safe_find_parent(s.find('img', class_='wp-image-2488'), 'a'), 'href'),
        '花好月圓': lambda s: safe_get(safe_find(s.find('div', class_='menuArea'), 'img'), 'src'),
        '茶湯會': lambda s: safe_get(s.find('a', class_='btn01'), 'href'),
        '大茗': lambda s: safe_get(safe_find(safe_find(s.find('div', id='intro'), 'p'), 'img'), 'src'),
        '上宇林': lambda s: _get_shangyulin_url(s),
        '鮮茶道': lambda s: _get_presotea_url(s),
        '吳家': lambda s: _prefix('https:', safe_get(safe_find(s.find('li', id='section-f_4cb060a0-3820-4739-ad05-b4cf6edaa6da'), 'img'), 'data-src')),
        '青山': lambda s: safe_get(safe_find(s.find('div', class_='img-inner'), 'img'), 'src'),
    }

    strategy = strategies.get(store)
    if strategy:
        return strategy(soup) or ''
    return ''


def _prefix(prefix, url):
    """若 url 非空則加上前綴"""
    return prefix + url if url else ''


def _get_macu_url(soup):
    """麻古茶坊：取第二個 menuListSub 下的連結"""
    tags = soup.find_all('nav', class_='menuListSub')
    if len(tags) < 2:
        return ''
    link = tags[1].find('a')
    return _prefix('https://www.macutea.com.tw/', safe_get(link, 'href'))


def _get_shangyulin_url(soup):
    """上宇林：相對路徑需要轉換"""
    tag = safe_find(safe_find(soup.find('div', class_='editor_content'), 'p'), 'img')
    src = safe_get(tag, 'src')
    if src.startswith('.'):
        src = src[2:]
    return f'https://www.shangyulin.com.tw/{src}' if src else ''


def _get_presotea_url(soup):
    """鮮茶道：相對路徑需要轉換"""
    tag = soup.find('a', id='menu_img_url')
    src = safe_get(tag, 'href')
    if src.startswith('.'):
        src = src[2:]
    return f'http://www.presotea.com.tw/{src}' if src else ''


def get_file_extension(url):
    """從 URL 取得圖片副檔名，不認識的格式預設回傳 .jpg"""
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    return ext if ext in ('.jpg', '.jpeg', '.png', '.webp') else '.jpg'


def download_image(img_url, save_path):
    """下載圖片到指定路徑"""
    try:
        response = requests.get(img_url, headers=DEFAULT_HEADERS, timeout=15)
        response.raise_for_status()
        with open(save_path, 'wb') as f:
            f.write(response.content)
        print(f'已下載：{save_path}')
    except Exception as e:
        print(f'無法下載 {img_url}：{e}')


def convert_pdf_to_image(pdf_data, page_number, output_image_path):
    """將 PDF 的特定頁面轉換為 JPEG 圖片"""
    images = convert_from_bytes(pdf_data, first_page=page_number, last_page=page_number)
    if images:
        images[0].save(output_image_path, 'JPEG')
        print(f"圖片已儲存至: {output_image_path}")
    else:
        print("無法提取該頁面作為圖片")


def download_pdf_menu(store, soup, verify):
    """
    處理 PDF 菜單的店家（可不可、迷客夏）。
    先從 HTML 找到 PDF 連結，下載後轉為圖片。
    """
    if store == '可不可':
        tag = safe_find(soup.find('div', class_='page-menu__download'), 'a')
        url = safe_get(tag, 'href')
        page = 3
    elif store == '迷客夏':
        tag = safe_find(soup.find('div', class_='about_list'), 'a')
        url = _prefix('https://www.milksha.com/', safe_get(tag, 'href'))
        page = 1
    else:
        return

    if not url:
        print(f'商家 {store} 找不到 PDF 連結')
        return

    response = requests.get(url, headers=DEFAULT_HEADERS, verify=verify, timeout=30)
    response.raise_for_status()
    convert_pdf_to_image(response.content, page, get_output_path(f'{store}.jpg'))


def download_images_from_url(store):
    """
    爬蟲主流程：根據商家名稱，抓取對應的菜單圖片。
    1. 從 storeAndUrl.json 取得 URL
    2. 抓取 HTML
    3. 根據店家類型，走 PDF 流程或一般圖片下載流程
    """
    store_dict = load_store_dict()
    store_url = store_dict.get(store)

    if not store_url:
        print(f'找不到商家 {store} 的網址')
        return

    verify = store not in SSL_SKIP_STORES

    try:
        response = requests.get(store_url, headers=DEFAULT_HEADERS, verify=verify, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f'無法連線到 {store_url}：{e}')
        return

    soup = BeautifulSoup(response.text, 'html.parser')

    # PDF 菜單店家走獨立流程
    if store in ('可不可', '迷客夏'):
        download_pdf_menu(store, soup, verify)
        return

    # 一般圖片下載流程
    img_url = get_image_url(store, soup)
    if not img_url:
        print(f'商家 {store} 沒有找到圖片 URL')
        return

    ext = get_file_extension(img_url)
    download_image(img_url, get_output_path(store, ext))


def main():
    parser = argparse.ArgumentParser(description="下載飲料店菜單圖片")
    parser.add_argument('stores', nargs='+', type=str, help="商家名稱清單（可多個，以空格分隔）")
    args = parser.parse_args()

    for store in args.stores:
        print(f'\n--- 處理商家: {store} ---')
        download_images_from_url(store)


if __name__ == '__main__':
    main()

const storeNames = [
  {
    value: '19',
    label: '19茶屋',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/19.jpg'
  },
  {
    value: '50嵐',
    label: '50嵐',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/50%E5%B5%90.jpg'
  },
  {
    value: 'coco',
    label: 'coco',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/coco.jpg'
  },
  {
    value: 'comebuy',
    label: 'comebuy',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/comebuy.jpg'
  },
  {
    value: 'teatop',
    label: 'teatop',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/teatop.jpg'
  },
  {
    value: '一沐日',
    label: '一沐日',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E4%B8%80%E6%B2%90%E6%97%A5.jpg'
  },
  {
    value: '五桐號',
    label: '五桐號',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E4%BA%94%E6%A1%90%E8%99%9F.jpg'
  },
  {
    value: '可不可',
    label: '可不可',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E5%8F%AF%E4%B8%8D%E5%8F%AF.jpg'
  },
  {
    value: '吾奶王',
    label: '吾奶王',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E5%90%BE%E5%A5%B6%E7%8E%8B.jpg'
  },
  {
    value: '大苑子',
    label: '大苑子',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E5%A4%A7%E8%8B%91%E5%AD%90.jpg'
  },
  {
    value: '德正',
    label: '德正',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E5%BE%B7%E6%AD%A3.jpg'
  },
  {
    value: '清心',
    label: '清心',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E6%B8%85%E5%BF%83.jpg'
  },
  {
    value: '烏弄',
    label: '烏弄',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E7%83%8F%E5%BC%84.jpg'
  },
  {
    value: '珍煮丹',
    label: '珍煮丹',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E7%8F%8D%E7%85%AE%E4%B8%B9.jpg'
  },
  {
    value: '萬波',
    label: '萬波',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E8%90%AC%E6%B3%A2.jpg'
  },
  {
    value: '迷客夏',
    label: '迷客夏',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E8%BF%B7%E5%AE%A2%E5%A4%8F.jpg'
  },
  {
    value: '阿義',
    label: '阿義',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E9%98%BF%E7%BE%A9.png'
  },
  {
    value: '鮮茶道',
    label: '鮮茶道',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E9%AE%AE%E8%8C%B6%E9%81%93.jpg'
  },
  {
    value: '麻古',
    label: '麻古',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E9%BA%BB%E5%8F%A4.jpg'
  },
  {
    value: '龜記',
    label: '龜記',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E9%BE%9C%E8%A8%98.jpg'
  },
  {
    value: '茶湯會',
    label: '茶湯會',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E8%8C%B6%E6%B9%AF%E6%9C%83.jpg'
  },
  {
    value: '花好月圓',
    label: '花好月圓',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E8%8A%B1%E5%A5%BD%E6%9C%88%E5%9C%93.png'
  },
  {
    value: '清原',
    label: '清原',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E6%B8%85%E5%8E%9F.jpg'
  },
  {
    value: '雷的茶',
    label: '雷的茶',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E9%9B%B7%E7%9A%84%E8%8C%B6.jpg'
  },
  {
    value: '蔗家店',
    label: '蔗家店',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E8%94%97%E5%AE%B6%E5%BA%97.jpg'
  },
  {
    value: '福氣塘',
    label: '福氣塘',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E7%A6%8F%E6%B0%A3%E5%A1%98.jpg'
  },
  {
    value: '大茗',
    label: '大茗本位製茶堂',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E5%A4%A7%E8%8C%97.png'
  },
  {
    value: 'tea',
    label: 'tea′s原味',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/tea.jpg'
  },
  {
    value: '上宇林',
    label: '上宇林',
    url: 'https://raw.githubusercontent.com/Gusty1/order-drink/refs/heads/master/src/assets/images/storeMenus/%E4%B8%8A%E5%AE%87%E6%9E%97.png'
  }
]

export default storeNames

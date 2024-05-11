import axios from 'axios';
import { load } from 'cheerio';

interface Story {
  title: string;
  link?: string;
  description?: string;
  author?: string;
  text: string;
}
const baseUrl = 'https://www.xigushi.com/';

const fetchStoryContent = async (
  url: string,
): Promise<{ content: string; description: string }> => {
  let content = '';
  let description = '';
  try {
    const response = await axios.get(url);
    const $ = load(response.data);
    content = $('.by>dl>dd>p').text();
    description = $('.by .info').text();
  } catch (error) {
    console.error('Error fetching content:', error);
  }
  return { content, description };
};
export async function fetchStoriesFromPage(): Promise<Story[]> {
  const url = baseUrl + 'thgs';
  try {
    const response = await axios.get(url);
    const $ = load(response.data);
    const storyElements = $('div.list>dl>dd li'); // 替换为实际选择器

    const stories: Story[] = storyElements
      .map((index, element) => {
        const titleElement = $(element).find('a'); // 替换为实际标题选择器
        const link = titleElement.attr('href') ?? ''; // 获取链接
        const title = titleElement.text().trim(); // 获取标题

        return { title, link, text: '' };
      })
      .get();
    for (const item of stories) {
      const { content, description } = await fetchStoryContent(
        baseUrl + item.link,
      );
      item.text = content;
      item.description = description;
      item.author = '佚名';
      delete item.link;
    }
    // 分页逻辑：找到下一页的链接
    // const nextPageLink = $('your-selector-for-next-page'); // 替换为实际的下一页链接选择器
    // if (nextPageLink.length > 0) {
    //   const nextPageUrl = nextPageLink.attr('href') ?? '';
    //   // 递归抓取下一页
    //   const nextPageStories = await fetchStoriesFromPage(nextPageUrl);
    //   return [...stories, ...nextPageStories];
    // }
    return stories;
  } catch (error) {
    console.error(`Error fetching stories from ${url}:`, error);
    return [];
  }
}

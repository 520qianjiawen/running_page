interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl === '/' ? '' : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: '大猫跑步记录',
  siteUrl: 'https://run.525.hk',
  logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTtc69JxHNcmN1ETpMUX4dozAgAN6iPjWalQ&usqp=CAU',
  description: '大猫的跑步轨迹、配速与城市足迹',
  navLinks: [
    {
      name: '轨迹',
      url: `${getBasePath()}/`,
    },
    {
      name: '统计',
      url: `${getBasePath()}/summary`,
    },
  ],
};

export default data;

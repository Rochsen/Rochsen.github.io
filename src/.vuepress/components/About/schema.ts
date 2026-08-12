// 技能
export interface skillSchema {
  name: string;
  svg: string;
  url: string;
}

// 人格类型
export interface personalitySchema {
  name: string;
  img: string;
  url: string;
}

// 职业生涯
export interface CareerSchema {
  step: number;
  title: string;
  description: string;
  state: string;
}

// 教育背景
export interface educationSchema {
  title: string;
  time: string;
  desc: string;
  img: string;
}

// 联系我
export interface contactMeSchema {
  title: string;
  buttonColor: string;
  icon: any;
  url: string;
}


export interface HeroSlide {
  bg: string;
  title: string;
  subtitle: string;
  features?: string[];
  buttons?: {
    text: string;
    link: string;
    primary: boolean;
  }[];
  image: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

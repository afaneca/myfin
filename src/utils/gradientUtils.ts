import { ColorGradient } from '../consts';

export function createCssGradientObject(
  color1: string,
  color2: string,
  angle: string = '90deg',
): string {
  return `linear-gradient(${angle}, ${color1}, ${color2})`;
}
export const cssGradients = {
  [ColorGradient.Red]: createCssGradientObject('#ff5252', '#f48fb1', '45deg'),
  [ColorGradient.Blue]: createCssGradientObject('#0288d1', '#26c6da', '45deg'),
  [ColorGradient.Green]: createCssGradientObject('#43a047', '#1de9b6', '45deg'),
  [ColorGradient.Orange]: createCssGradientObject(
    '#ff6f00',
    '#ffca28',
    '45deg',
  ),
  [ColorGradient.DarkGray]: createCssGradientObject(
    '#424242',
    '#757575',
    '45deg',
  ),
  [ColorGradient.LightGray]: createCssGradientObject(
    '#797979',
    '#b9b7b7',
    '45deg',
  ),
  [ColorGradient.Purple]: createCssGradientObject(
    '#7b1fa2',
    '#ba68c8',
    '45deg',
  ),
  [ColorGradient.Pink]: createCssGradientObject('#d81b60', '#f06292', '45deg'),
  [ColorGradient.DarkBlue]: createCssGradientObject(
    '#1a237e',
    '#3949ab',
    '45deg',
  ),
  [ColorGradient.Brown]: createCssGradientObject('#5d4037', '#8d6e63', '45deg'),
  [ColorGradient.LightGreen]: createCssGradientObject(
    '#689f38',
    '#aed581',
    '45deg',
  ),
  [ColorGradient.DarkRed]: createCssGradientObject(
    '#b71c1c',
    '#e57373',
    '45deg',
  ),
  [ColorGradient.Yellow]: createCssGradientObject(
    '#fdd835',
    '#fff176',
    '45deg',
  ),
  [ColorGradient.Roseanna]: createCssGradientObject(
    '#ffafbd',
    '#ffc3a0',
    '45deg',
  ),
  [ColorGradient.Mauve]: createCssGradientObject('#42275a', '#734b6d', '45deg'),
  [ColorGradient.Lush]: createCssGradientObject('#56ab2f', '#a8e063', '45deg'),
  [ColorGradient.PaleWood]: createCssGradientObject(
    '#eacda3',
    '#d6ae7b',
    '45deg',
  ),
  [ColorGradient.Aubergine]: createCssGradientObject(
    '#aa076b',
    '#61045f',
    '45deg',
  ),
  [ColorGradient.OrangeCoral]: createCssGradientObject(
    '#ff9966',
    '#ff5e62',
    '45deg',
  ),
  [ColorGradient.Decent]: createCssGradientObject(
    '#4ca1af',
    '#c4e0e5',
    '45deg',
  ),
  [ColorGradient.Dusk]: createCssGradientObject('#2c3e50', '#bdc3c7', '45deg'),
  [ColorGradient.Dull]: createCssGradientObject('#C9D6FF', '#E2E2E2', '45deg'),
  [ColorGradient.BlueColor]: '#a6cee3',
  [ColorGradient.GreenColor]: '#7fc97f',
  [ColorGradient.TealColor]: '#61cdbb',
  [ColorGradient.CoralColor]: '#f47560',
  [ColorGradient.YellowColor]: '#f1e15b',
  [ColorGradient.OrangeColor]: '#e8a838',
  [ColorGradient.AquaColor]: '#97e3d5',
  [ColorGradient.PaleColor]: '#e8c1a0',
  [ColorGradient.BrownColor]: '#9c755f',
  [ColorGradient.PinkColor]: '#bc80bd',
  [ColorGradient.RedColor]: '#ff596f',
  [ColorGradient.None]: 'transparent',
};

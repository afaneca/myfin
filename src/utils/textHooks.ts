import { formatNumberAsCurrency, formatStringAsCurrency } from './textUtils.ts';
import { useUserData } from '../providers/UserProvider.tsx';

export const useFormatStringAsCurrency = () => {
  const { userSessionData } = useUserData();

  function invoke(text: string): string {
    return formatStringAsCurrency(text, userSessionData?.currency);
  }

  return {
    invoke,
  };
};

export const useFormatNumberAsCurrency = () => {
  const { userSessionData } = useUserData();

  function invoke(text: number): string {
    return formatNumberAsCurrency(text, userSessionData?.currency);
  }

  return {
    invoke,
  };
};

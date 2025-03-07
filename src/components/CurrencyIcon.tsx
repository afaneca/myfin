import { useUserData } from '../providers/UserProvider.tsx';
import { CURRENCIES } from '../consts/Currency.ts';
import {
  AttachMoney,
  CurrencyPound,
  CurrencyRupee,
  CurrencyYen,
  CurrencyYuan,
  Euro,
} from '@mui/icons-material';

const CurrencyIcon = () => {
  const { userSessionData } = useUserData();

  switch (userSessionData?.currency) {
    case CURRENCIES.EUR.code:
      return <Euro />;
    case CURRENCIES.INR.code:
      return <CurrencyRupee />;
    case CURRENCIES.JPY.code:
      return <CurrencyYen />;
    case CURRENCIES.GBP.code:
      return <CurrencyPound />;
    case CURRENCIES.CNY.code:
      return <CurrencyYuan />;
    case CURRENCIES.USD.code:
    default:
      return <AttachMoney />;
  }
};

export default CurrencyIcon;

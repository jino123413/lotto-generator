import { createRoute } from '@granite-js/react-native';
import LottoGenerator from '../src/components/LottoGenerator';

export const Route = createRoute('/', {
  validateParams: (params) => params,
  component: HomePage,
});

export function HomePage() {
  return <LottoGenerator />;
}

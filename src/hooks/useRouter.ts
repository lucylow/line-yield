import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ROUTES, ROUTE_METADATA, requiresAuth } from '../utils/routes';
import { navigation } from '../utils/navigation';

export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  return {
    // Navigation methods
    navigate,
    goTo: (path: string, options?: { replace?: boolean; state?: any }) => {
      if (options?.replace) {
        navigate(path, { replace: true, state: options.state });
      } else {
        navigate(path, { state: options?.state });
      }
    },
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
    replace: (path: string, state?: any) => navigate(path, { replace: true, state }),

    // Route information
    currentPath: location.pathname,
    currentSearch: location.search,
    currentHash: location.hash,
    currentState: location.state,
    params,

    // Route utilities
    isActive: (path: string) => location.pathname === path,
    isActiveRoute: (routeKey: keyof typeof ROUTES) => location.pathname === ROUTES[routeKey],
    requiresAuth: (path?: string) => requiresAuth(path || location.pathname),

    // Route metadata
    getPageTitle: (path?: string) => navigation.getPageTitle(path || location.pathname),
    getPageDescription: (path?: string) => navigation.getPageDescription(path || location.pathname),
    getCanonicalUrl: (path?: string) => navigation.getCanonicalUrl(path || location.pathname),

    // Quick navigation methods
    goHome: () => navigate(ROUTES.HOME),
    goDashboard: () => navigate(ROUTES.DASHBOARD),
    goLoans: () => navigate(ROUTES.LOANS),
    goReferral: () => navigate(ROUTES.REFERRAL),
    goNFT: () => navigate(ROUTES.NFT),
    goSettings: () => navigate(ROUTES.SETTINGS),
    goProfile: () => navigate(ROUTES.PROFILE),
    goHelp: () => navigate(ROUTES.HELP),
    goTerms: () => navigate(ROUTES.TERMS),
    goPrivacy: () => navigate(ROUTES.PRIVACY),
    goNotFound: () => navigate(ROUTES.NOT_FOUND),

    // Search params utilities
    getSearchParam: (key: string) => {
      const searchParams = new URLSearchParams(location.search);
      return searchParams.get(key);
    },
    setSearchParam: (key: string, value: string) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set(key, value);
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    },
    removeSearchParam: (key: string) => {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete(key);
      const newSearch = searchParams.toString();
      navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
    },

    // Route validation
    isValidRoute: (path: string) => Object.values(ROUTES).includes(path as any),
  };
};

export default useRouter;


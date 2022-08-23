import React, { FC, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import SideMenu from '../components/SideMenu';
import PageTitle from '../components/PageTitle';
interface Props {
  children: JSX.Element;
}

const Layout: FC<Props> = ({ children }) => {
  const location = useLocation();

  const navShow = useMemo(() => {
    const path = location.pathname;
    return !(path === '/');
  }, [location.pathname]);

  return (
    <>
      {navShow && <PageTitle />}
      <div className='p-3 max-w-[1000px] m-auto relative overflow-hidden'>
        <SideMenu />
        <div>{children}</div>
      </div>
    </>
  );
};

export default Layout;

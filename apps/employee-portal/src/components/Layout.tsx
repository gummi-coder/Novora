import React from 'react';
import styled from 'styled-components';
import { Outlet, Link, useLocation } from 'react-router-dom';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.background.default};
`;

const Header = styled.header`
  background-color: ${props => props.theme.colors.primary.main};
  color: white;
  padding: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  color: white;
  text-decoration: none;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${props => props.theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <h1>Novora Survey</h1>
          </Link>
          <Nav>
            <NavLink to="/" $isActive={location.pathname === '/'}>
              Dashboard
            </NavLink>
            <NavLink to="/surveys" $isActive={location.pathname.startsWith('/surveys')}>
              Surveys
            </NavLink>
          </Nav>
        </HeaderContent>
      </Header>
      <Main>
        <Outlet />
      </Main>
    </LayoutContainer>
  );
};

export default Layout; 
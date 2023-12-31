import React, { Component, Suspense } from 'react';
import {Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';
import Tables from './Tables';
import {
  AppAside,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppBreadcrumb2 as AppBreadcrumb,
  AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../../../_nav';
// routes config
import routes from '../../../../routes';

const DefaultAside = React.lazy(() =>
  import('../../../../containers/DefaultLayout/DefaultAside')
);
const DefaultFooter = React.lazy(() =>
  import('../../../../containers/DefaultLayout/DefaultFooter')
);
const DefaultHeader = React.lazy(() =>
  import('../../../../containers/DefaultLayout/DefaultHeader')
);

class ListWorkAtClient extends Component {
  loading = () => (
    <div className="animated fadeIn pt-1 text-center">Loading...</div>
  );

  signOut(e) {
    e.preventDefault();
    this.props.history.push('/login');
  }

  render() {
    var token = localStorage.getItem('token');
    var RoleId = localStorage.getItem('RoleId')
    if (token === null || token === undefined ||RoleId === null || RoleId === undefined) {
      this.props.history.push('/login');
    }
    var accessRole = localStorage.getItem("accessRole");
    console.log(navigation);
    var navBar = {};
    var navBarItems = [];
    for (var item of navigation.items) {
      if (item.name === "Menu") {
        navBarItems.push(item);
      } else {
        if (item.children && item.children.length > 0) {
          var children = item.children.filter(s => s.role.includes(accessRole));
          var navBarItem = {};
          Object.assign(navBarItem, item);
          navBarItem.children = children;
          if (children.length > 0) {
            navBarItems.push(navBarItem);
          }
        }
      }
    }
    console.log(accessRole);
    console.log(navBarItems);
    navBar.items = navBarItems;
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)} />
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
              <AppSidebarNav
                navConfig={navBar}
                {...this.props}
                router={router}
              />
            </Suspense>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            <AppBreadcrumb appRoutes={routes} router={router} />
            <Container fluid>
              <Suspense fallback={this.loading()}>
                <Tables />
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        render={props => <route.component {...props} />}
                      />
                    ) : null;
                  })}

               
                </Switch>
              </Suspense>
            </Container>
          </main>
          <AppAside fixed>
            <Suspense fallback={this.loading()}>
              <DefaultAside />
            </Suspense>
          </AppAside>
        </div>
        <AppFooter>
          <Suspense fallback={this.loading()}>
            <DefaultFooter />
          </Suspense>
        </AppFooter>
      </div>
    );
  }
}

export default ListWorkAtClient;

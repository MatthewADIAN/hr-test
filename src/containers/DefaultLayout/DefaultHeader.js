import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Badge,
  UncontrolledDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
} from "reactstrap";
import PropTypes from "prop-types";

import { AppNavbarBrand, AppSidebarToggler } from "@coreui/react";
import logo from "../../assets/img/brand/logo.png";
import account from "../../assets/img/brand/account.png";
import Service from "./Service";

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};
const PERSONALIA_BAGIAN = "Personalia Bagian";
const PERSONALIA_PUSAT = "Personalia Pusat";
const PIMPINAN = "Pimpinan";

class DefaultHeader extends Component {
  constructor(props) {
    super(props);
    this.service = new Service();
  }

  state = {
    loading: false,

    unconfirmRequest: 0,
    userUnitId: localStorage.getItem("unitId"),
    userAccessRole: localStorage.getItem("accessRole"),
    unReadDataRevision: 0,
    unReadSuggestionForCompany: 0,
    userName: localStorage.getItem("username")
  };

  handleLogout = () => {
    // localStorage.removeItem("token");
    //localStorage.removeItem("logged");
    localStorage.clear();
    window.location.href = "/#/login";
  };

  componentDidMount() {
    this.setData();
  }

  goToRequestLeave = () => {
    window.location.href = "/#/approval/request-leave";
  };
  setData = () => {
    console.log("this.state.userAccessRole", this.state.userAccessRole);
    let unitId =
      this.state.userAccessRole == PERSONALIA_BAGIAN
        ? this.state.userUnitId
        : 0;
    //this.setState({ loadingData: true })
    this.service.getNotif(unitId).then((result) => {
      this.setState({ unconfirmRequest: result.UnconfirmRequest });
    });

    if (
      this.state.userAccessRole === PERSONALIA_BAGIAN ||
      this.state.userAccessRole === PERSONALIA_PUSAT
    ) {
      this.service.getNotifDataRevision().then((result) => {
        this.setState({ unReadDataRevision: result.UnconfirmRequest });
      });
      this.service.getNotifSuggestionForCompany().then((result) => {
        this.setState({ unReadSuggestionForCompany: result.UnconfirmRequest });
      });
    }
  };

  goToSuggestionBox = (type) => {
    if (type === 0) {
      this.service
        .updateStatus(0)
        .then((result) => {
          this.service.getNotifDataRevision().then((result) => {
            this.setState({ unReadDataRevision: result.UnconfirmRequest });
          });
        })
        .catch((err) => {});

      window.location.href = "/#/suggestionbox/suggestion-box-recap";
    } else {
      this.service
        .updateStatus(1)
        .then((result) => {
          this.service.getNotifSuggestionForCompany().then((result) => {
            this.setState({ unReadSuggestionForCompany: result.UnconfirmRequest });
          });
        })
        .catch((err) => {});

      window.location.href =
        "/#/suggestionbox/suggestion-box-recap-company-suggestion";
    }
  };

  totalNotificationNumber = () => {
    let total = 0;
    const {userAccessRole, unReadSuggestionForCompany, unReadDataRevision, unconfirmRequest} = this.state;
    if(userAccessRole === PIMPINAN){
      total =+ unconfirmRequest;
    }

    if(userAccessRole === PERSONALIA_PUSAT || userAccessRole === PERSONALIA_BAGIAN){
      total =+ unReadDataRevision + unReadSuggestionForCompany;
    }

    return total > 0 ? total : ""
  }

  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{ src: logo, height: 50, alt: "CoreUI Logo" }}
          minimized={{ src: logo, width: 30, height: 30, alt: "CoreUI Logo" }}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        {/* <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink to="/dashboard" className="nav-link" >Dashboard</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <Link to="/users" className="nav-link">Users</Link>
          </NavItem>
          <NavItem className="px-3">
            <NavLink to="#" className="nav-link">Settings</NavLink>
          </NavItem>
        </Nav> */}

        <Nav className="ml-auto" navbar>
          {/* <NavItem className="d-md-down-none">
            <NavLink to="/approval/request-leave" className="nav-link"><i className="icon-bell">
            </i>
            <Badge pill color="danger">1</Badge>
            </NavLink>
          </NavItem>
          <NavItem className="d-md-down-none">
            <NavLink to="#" className="nav-link"><i className="icon-list"></i></NavLink>
          </NavItem>
          <NavItem className="d-md-down-none">
            <NavLink to="#" className="nav-link"><i className="icon-location-pin"></i></NavLink>
          </NavItem> */}

          <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
              <i className="icon-bell"></i>
              <Badge pill color="danger">
                {this.totalNotificationNumber()}
              </Badge>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem header tag="div" className="text-center">
                <strong>Notifikasi</strong>
              </DropdownItem>
              <DropdownItem onClick={this.goToRequestLeave}>
                <i className="fa fa-tasks"></i>Request Cuti
                {this.state.unconfirmRequest > 0 &&
                this.state.userAccessRole === PIMPINAN ? (
                  <Badge pill color="danger" style={{ marginTop: -7 }}>
                    {this.state.unconfirmRequest}
                  </Badge>
                ) : (
                  ""
                )}
              </DropdownItem>
              {(this.state.userAccessRole === PERSONALIA_PUSAT ||
                this.state.userAccessRole === PERSONALIA_BAGIAN) && (
                <DropdownItem onClick={() => this.goToSuggestionBox(0)}>
                  <i className="fa fa-tasks"></i>Revisi Data
                  {this.state.unReadDataRevision > 0 ? (
                    <Badge pill color="danger" style={{ marginTop: -7 }}>
                      {this.state.unReadDataRevision}
                    </Badge>
                  ) : (
                    ""
                  )}
                </DropdownItem>
              )}

              {(this.state.userAccessRole === PERSONALIA_PUSAT ||
                this.state.userAccessRole === PERSONALIA_BAGIAN) && (
                <DropdownItem onClick={() => this.goToSuggestionBox(1)}>
                  <i className="fa fa-tasks"></i>Saran Untuk Perusahaan
                  {this.state.unReadSuggestionForCompany > 0 ? (
                    <Badge pill color="danger" style={{ marginTop: -7 }}>
                      {this.state.unReadSuggestionForCompany}
                    </Badge>
                  ) : (
                    ""
                  )}
                </DropdownItem>
              )}
            </DropdownMenu>
          </UncontrolledDropdown>

          <UncontrolledDropdown nav direction="down">
            <DropdownToggle nav>
              <img src={account} className="img-avatar" alt="profile" />
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem header tag="div" className="text-center">
                <strong>Account: {this.state.userName}</strong>
              </DropdownItem>

              {/* <DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge color="info">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-comments"></i> Comments<Badge color="warning">42</Badge></DropdownItem> */}

              {/* <DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem> */}
              {/* <DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>
              <DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>
              <DropdownItem><i className="fa fa-usd"></i> Payments<Badge color="secondary">42</Badge></DropdownItem>
              <DropdownItem><i className="fa fa-file"></i> Projects<Badge color="primary">42</Badge></DropdownItem> */}
              {/* <DropdownItem divider />
              <DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem> */}
              <DropdownItem onClick={this.handleLogout}>
                <i className="fa fa-lock"></i> Logout
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        {/* <AppAsideToggler className="d-md-down-none" /> */}
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;

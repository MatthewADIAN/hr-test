import React, { Component } from 'react';
import { Button, Card, CardBody, CardGroup, Spinner, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row, CardImg, CardText } from 'reactstrap';
import Logo from '../../../assets/img/brand/logo-white.png'
import axios from 'axios'
import * as CONST from '../../../Constant'
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      username: '',
      password: '',
      logged: false,
      messageErrorPassword: '',
      messageErrorUsername: '',
      url: CONST.urlLogin,
      passwordTextType: 'password',
      showEyeSlashPasswordIcon: true
    }
  }

  handleUsername = (e) => {
    var values = e.target.value;
    if (values !== "") {
      this.setState({
        messageErrorUsername: ''
      })
    }

    this.setState({
      username: e.target.value
    })

  }


  handlePassword = (e) => {
    var valuesPassword = e.target.value;
    if (valuesPassword !== "") {
      this.setState({
        messageErrorPassword: ''
      })
    }
    this.setState({
      password: e.target.value
    })
  }

  onHandleSubmit = e => {

    e.preventDefault();

    if (!this.validate()) {
      return;
    }

    this.setState({ loading: true })
    var username = this.state.username;
    var password = this.state.password;
    if ((username !== null && username !== "") && (password !== null && password !== "")) {
      const Header = {
        accept: 'application/json',
        'Content-Type': 'application/json-patch+json'
      }

      const Data = {
        username: this.state.username,
        password: this.state.password,
      }

      axios({
        method: 'post', url: this.state.url, headers: Header, data: Data,
      }).then(data => {

        var token = data.data.data;

        const Headers = {
          'accept': 'application/json',
          'Authorization': `Bearer ` + token,
        }
        axios({
          method: 'get',
          url: CONST.urlMe,
          headers: Headers,
        }).then(res => {
          this.setState({ loading: false })

          let nik = res.data.data.employeeIdentity;
          let username = res.data.data.username;
          let role = nik.slice(0, 4);
          let accessRole = res.data.data.accessRole;
          let unitId = res.data.data.unitId;
          if (!accessRole) {
            throw "Belum Memiliki Hak Akses";
          }

          localStorage.setItem("token", token);
          localStorage.setItem("logged", true);
          localStorage.setItem("nik", nik);
          localStorage.setItem("username", username);
          localStorage.setItem("role", CONST.HR_CODE.indexOf(role) != -1 ? "1" : "0");
          localStorage.setItem("unitId", unitId);

          if (username !== 'dev2') {
            axios({
              method: 'get',
              url: CONST.urlAccessUnit.replace(/{employeeIdentity}/, nik),
              headers: Headers,
            }).then(res => {
              const otherUnitIds = res.data.EmployeeUnitAccessItems.map(d => d.UnitId);
              localStorage.setItem("otherUnitId", JSON.stringify(otherUnitIds));
              localStorage.setItem("employeeId", JSON.stringify(res.data.Id));
              localStorage.setItem("accessRole", accessRole);
              this.props.history.push('/absensi/listallabsen')
            })
          } else {
            localStorage.setItem("otherUnitId", JSON.stringify([]));
            localStorage.setItem("employeeId", JSON.stringify(0));
            localStorage.setItem("accessRole", "Personalia Pusat");
            this.props.history.push('/absensi/listallabsen')
          }

        }).catch(err => {
          this.setState({ loading: false })

          alert(err);
        })

      }).catch(err => {

        this.setState({ loading: false })
        alert("username atau password tidak ditemukan")
      });
    }

  }

  validate = () => {
    let valid = true;
    var username = this.state.username;
    var password = this.state.password;

    if (username === null || username === "") {
      this.setState({
        messageErrorUsername: 'Username Tidak Boleh Kosong'
      })
      valid = false
    }

    if (password === null || password === "") {
      this.setState({
        messageErrorPassword: 'Password tidak boleh kosong'
      })
      valid = false
    }

    return valid
  }

  showPassword = () => {
    if (this.state.passwordTextType === 'password') {
      this.setState({
        passwordTextType: 'text',
        showEyeSlashPasswordIcon: false
      })
    } else {
      this.setState({
        passwordTextType: 'password',
        showEyeSlashPasswordIcon: true
      })
    }
  }

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form onSubmit={this.onHandleSubmit}> 
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" required onChange={this.handleUsername} placeholder="Username" autoComplete="username" />
                      </InputGroup>
                      <font color="red">{this.state.messageErrorUsername}</font>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type={this.state.passwordTextType} className='border border-right-0' onChange={this.handlePassword} placeholder="Password" autoComplete="current-password" />
                        <InputGroupAddon addonType="append">
                          <Button className='bg-transparent border border-left-0 solid transparent' onClick={this.showPassword}>
                            <i className={`fa ${this.state.showEyeSlashPasswordIcon ? "fa-eye-slash" : "fa-eye" }`}></i>
                          </Button>
                        </InputGroupAddon>
                      </InputGroup>
                      <font color="red">{this.state.messageErrorPassword}</font>
                      <Row>
                        <Col xs="6">
                          {this.state.loading ? (
                            <span><Spinner size="sm" color="primary" /> Logging in...</span>
                          ) : (
                            <Button type='submit' color="primary" className="px-4">Login</Button>
                          )}
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card body className="justify-content-center" style={{ width: '44%', backgroundColor: '#0563B1', }}>
                  <CardImg src={Logo} alt="Logo" style={{ padding: 'auto' }} />
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;

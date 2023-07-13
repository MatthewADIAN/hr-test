import React from 'react';
import { Button, ModalFooter, ModalHeader } from 'reactstrap';
import { Modal, ModalBody, Form, Spinner, FormGroup, FormControl, FormLabel, Row, Col } from "react-bootstrap";

class EditEmployeeModal extends React.Component {
    constructor(props) {

      this.props = props;

        this.state = {
            showModal: props.showModal,
            editEmployeeForm: {},
            defaultEmployeeData: props.employeeData,
            updateEmployeeLoading: false
        }

        console.log(this)
    }

    showEditEmployeeModal = (value) => {
        this.setState({ showModal: value })
    }

    updateEmployeeClickHandler = () => {
        this.setState({ updateEmployeeLoading: true })
        console.log(this.state);
        this.setState({ updateEmployeeLoading: false })
    }

    render() {
        return (
            <Modal aria-labelledby="modal-ubah-data" show={this.state.showModal} onHide={() => this.showEditEmployeeModal(false)} animation={true}>
                <ModalHeader closeButton>
                    <Modal.Title id="modal-ubah-data">Ubah Data Karyawan</Modal.Title>
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <Row>
                            <Col>
                                <FormLabel>Nama Depan</FormLabel>
                            </Col>
                            <Col>
                                <FormControl placeholder="Nama depan" defaultValue={this.defaultEmployeeData.Name} value={this.state.editEmployeeForm.FirstName}
                                // onChange={(e) => {
                                //     employeeToUpdateData.FirstName = e.target.value;
                                //     this.setState({ employeeToUpdateData: employeeToUpdateData })
                                // }}
                                />
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    {this.state.updateEmployeeLoading ? (<span><Spinner size="sm" color="primary" /> Mohon tunggu...</span>) : (
                        <div>
                            <Button className="btn btn-success" name="update-employee" onClick={this.updateEmployeeClickHandler}>Simpan</Button>
                        </div>
                    )}
                </ModalFooter>
            </Modal>
        );
    }
}

export default EditEmployeeModal;

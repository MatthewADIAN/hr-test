import React from 'react';
import { Button, Table } from 'reactstrap';

const moment = require('moment');

const ViewTableComponent = (props) => {
    const { data } = props;

    const items = data.map((training) => {
        return (<tr key={training.Id} data-category={training.Id}>
            <td>{moment(training.Date).format("MM/DD/YYYY")}</td>
            <td>{training.TrainingType}</td>
            <td>{training.TrainingName}</td>
            <td>{training.Remark}</td>
        </tr>)
    })

    return (<Table id="viewTable" responsive striped bordered>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Jenis Pelatihan</th>
                <th>Pelatihan</th>
                <th>Keterangan</th>
            </tr>
        </thead>
        <tbody>{items}</tbody>
    </Table>);
}

export default ViewTableComponent;
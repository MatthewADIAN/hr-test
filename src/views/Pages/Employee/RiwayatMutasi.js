import React from "react";
import { Button, Table } from "reactstrap";

const moment = require("moment");

const RiwayatMutasiComponent = (props) => {
  const { data } = props;

  const items = data.map((mutationLog, i) => {
    return (
      <tr key={mutationLog.Id} data-category={mutationLog.Id}>
        <td className="text-center">{i + 1}</td>
        <td>{moment(mutationLog.CreatedUtc).format("DD/MM/YYYY")}</td>
        <td>{mutationLog.MutationFrom}</td>
        <td>{mutationLog.Description}</td>
      </tr>
    );
  });

  return (
    <Table id="viewTable" responsive striped bordered>
      <thead>
        <tr>
          <th className="text-center">No</th>
          <th>Tanggal Mutasi</th>
          <th>Mutasi dari</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>{items}</tbody>
    </Table>
  );
};

export default RiwayatMutasiComponent;

import React, { Fragment } from "react";
import "react-datepicker/dist/react-datepicker.css";

const moment = require("moment");

const Schedules = ({ data }) => {
  const renderName = (name) => {
    if (name.includes("LIBUR")) {
      name = name.replace("\n(00:00 - 00:00)", "");

      return (
        <div
          style={{ whiteSpace: "pre-wrap", fontSize: 13, textAlign: "center" }}
        >
          {name}
        </div>
      );
    }

    return (
      <div
        style={{ whiteSpace: "pre-wrap", fontSize: 13, textAlign: "center" }}
      >
        {name}
      </div>
    );
  };

  return (
    <div>
      <tr className="text-center">
        <th style={{ width: "16%" }}>Periode</th>
        <th style={{ width: "12%" }}>Senin</th>
        <th style={{ width: "12%" }}>Selasa</th>
        <th style={{ width: "12%" }}>Rabu</th>
        <th style={{ width: "12%" }}>Kamis</th>
        <th style={{ width: "12%" }}>Jumat</th>
        <th style={{ width: "12%" }}>Sabtu</th>
        <th style={{ width: "12%" }}>Minggu</th>
      </tr>
      {data.map((d, i) => {
        console.log('fad',d);
        return(
        <Fragment>
          <tr key={i} data-category={i}>
            <td>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                {moment(d.StartPeriod).format("DD MMM YYYY").toString()} -{" "}
                {moment(d.EndPeriod).format("DD MMM YYYY").toString()}
              </div>
            </td>
            <td>{renderName(d.ShiftScheduleMondayName)}</td>
            <td>{renderName(d.ShiftScheduleTuesdayName)}</td>
            <td>{renderName(d.ShiftScheduleWednesdayName)}</td>
            <td>{renderName(d.ShiftScheduleThursdayName)}</td>
            <td>{renderName(d.ShiftScheduleFridayName)}</td>
            <td>{renderName(d.ShiftScheduleSaturdayName)}</td>
            <td>{renderName(d.ShiftScheduleSundayName)}</td>
          </tr>
        </Fragment>
      )
      })}
    </div>
  );
};

export default Schedules;

import React, { Component } from "react";
import { Table } from "react-bootstrap";

export default class TableDragScrollable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      left: 0,
    };

    this.slider = React.createRef();
  }

  onMouseDown = (e) => {
    e.persist();
    this.isDown = true;

    this.startX = e.pageX - this.slider.current.offsetLeft;
    this.scrollLeft = this.slider.current.scrollLeft;
    this.slider.current.style.cursor = "grabbing";
    console.log(
      e.pageX,
      this.slider.current.offsetLeft,
      this.slider.current.scrollLeft
    );
  };

  onMouseLeave = () => {
    this.isDown = false;
  };

  onMouseUp = () => {
    this.isDown = false;
    this.slider.current.style.cursor = "pointer";
  };

  onMouseMove = (e) => {
    if (!this.isDown) {
      return;
    }

    e.preventDefault();
    var x = e.pageX - this.slider.current.offsetLeft;
    var walk = (this.startX - x) / 20;
    var z = this.slider.current.scrollLeft - walk;

    this.setState({ left: this.state.left + z }, () => {
      this.slider.current.scrollLeft = this.state.left;
    });
  };

  mouseMove = () => {
    let elmnt1 = this.props.elementContainer;
    let elmnt2 = document.getElementById("slider");
    console.log("elmnt1", elmnt1);
    if (
      elmnt1?.scrollWidth &&
      elmnt2?.scrollWidth &&
      elmnt1?.scrollWidth < elmnt2.scrollWidth
    ) {
      const diff = elmnt1.scrollWidth - elmnt2.scrollWidth;
      if (this.state.left > 0) {
        this.setState({ left: 0 });
        return;
      } else if (this.state.left < diff) {
        this.setState({ left: diff });
        return;
      }
      return {
        transform: `translatex(${this.state.left}px)`,
      };
    }
  };

  render() {
    return (
      <Table
        id="slider"
        responsive
        bordered
        striped
        onMouseDown={this.onMouseDown}
        style={this.mouseMove()}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        ref={this.slider}
      >
        {this.props.children}
      </Table>
    );
  }
}

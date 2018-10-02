import React, { Component } from "react";
import Notification from "rc-notification";
import "./style.css";

let notification = null;
Notification.newInstance({}, n => (notification = n));

class Prompt extends Component {
  static message = (content, callback) => {
    notification.notice({
      content,
      onClose() {
        callback && callback();
      }
    });
  };

  render() {
    return <div />;
  }
}

export default Prompt;

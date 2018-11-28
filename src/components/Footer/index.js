import React from "react";
import { Link } from "react-router-dom";

import okIcon from "../../assets/ok.png";
import cancelIcon from "../../assets/cancel.png";

import "./style.css";

/*<const Item = ({ path, icon, children }) => {
  return (
    <Link to={path} className="footer-item">
      <div className="icon">
        <img src={icon} alt="Kolf" />
      </div>
      <p className="label">
        <span>{children}</span>
      </p>
    </Link>
  );
};*/

const Item = ({ path, icon, children }) => {
  return (
    <Link to={path} className="footer-item">
      <div className="icon">
        <img src={icon} alt="Kolf" />
      </div>
      <p className="label">
        <span>{children}</span>
      </p>
    </Link>
  );
};

const Item1 = ({ icon, children,onClick,classname }) => {
  return (
    <div className={classname} onClick={onClick}>
      <div className="icon">
        <img src={icon} alt="Kolf" />
      </div>
      <p className="label">
        <span>{children}</span>
      </p>
    </div>
  );
};

const Title = ({ children }) => {
  return (
    <div className="footer-item" style={{ paddingTop: 0 }}>
      <p className="label" style={{ fontSize: ".6rem", lineHeight: "2rem" }}>
        <span>{children}</span>
      </p>
    </div>
  );
};

const OkIcon = ({ onClick }) => {
  return (
    <div
      className="footer-item"
      style={{ width: 60, flex: "none", paddingTop: ".5rem" }}
    >
      <div className="icon" onClick={onClick}>
        <img src={okIcon} alt="Kolf" />
      </div>
    </div>
  );
};

const CancelIcon = ({ onClick }) => {
  return (
    <div
      className="footer-item"
      style={{ width: 60, flex: "none", paddingTop: ".5rem" }}
    >
      <div className="icon" onClick={onClick}>
        <img src={cancelIcon} alt="Kolf" />
      </div>
    </div>
  );
};

const Footer = ({ children, style }) => {
  return (
    <div className="footer" style={style || null}>
      {children}
    </div>
  );
};

Footer.Item = Item;
Footer.Item1 = Item1;

Footer.Title = Title;
Footer.OkIcon = OkIcon;
Footer.CancelIcon = CancelIcon;

export default Footer;

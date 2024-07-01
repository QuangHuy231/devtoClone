import React, { useState } from "react";
import "./Related.css";

const Related = ({ setFollowedPost }) => {
  const [selected, setSelected] = useState("home");
  return (
    <div className="related-container">
      <div
        className={
          selected === "home" ? "related-button select" : "related-button"
        }
        onClick={() => {
          setSelected("home");
          setFollowedPost(false);
        }}
      >
        Home
      </div>
      <div
        className={
          selected === "followed" ? "related-button select" : "related-button"
        }
        onClick={() => {
          setSelected("followed");
          setFollowedPost(true);
        }}
      >
        Followed
      </div>
    </div>
  );
};

export default Related;

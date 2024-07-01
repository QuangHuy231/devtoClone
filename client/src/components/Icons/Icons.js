import React from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import { FaRegBookmark, FaBookmark } from "react-icons/fa";

const LikeIcon = ({ state, color, size }) => {
  const Heart = state ? AiFillHeart : AiOutlineHeart;
  return (
    <Heart
      size={size}
      color={color}
      fill="currentColor"
      stroke="currentColor"
      style={{ cursor: "pointer" }}
    />
  );
};

const BookmarkIcon = ({ state, color, size }) => {
  const Bookmark = state ? FaBookmark : FaRegBookmark;
  return (
    <Bookmark
      size={size}
      color={color}
      fill="currentColor"
      stroke="currentColor"
      style={{ cursor: "pointer" }}
    />
  );
};

export { LikeIcon, BookmarkIcon };

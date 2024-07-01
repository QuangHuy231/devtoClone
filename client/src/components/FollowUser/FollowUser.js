import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/auth";
import { SocketContext } from "../../context/socket";
import useHttpClient from "../../hooks/useHttpClient";
import { checkInArray } from "../../utils";
import "./FollowUser.css";

export const FollowUser = ({
  followId,
  setShowModal,
  followers,
  userToFollow,
}) => {
  const { currentUser } = useContext(AuthContext);
  const { current } = useContext(SocketContext).socket;
  const currentUserId = currentUser && currentUser.userId;
  const { sendReq } = useHttpClient();

  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(checkInArray(followers, currentUserId));
  }, [followers, currentUserId]);

  const handleFollow = () => {
    !currentUserId ? setShowModal(true) : followUser(followId);
  };

  const followUser = async (followId) => {
    let action = following ? "unfollow" : "follow";
    setFollowing((following) => !following);
    if (action === "follow") {
      current.emit("follow", {
        sender: currentUser,
        receiver: userToFollow,
      });
    }

    try {
      await sendReq(
        `${process.env.REACT_APP_BASE_URL}/user/${action}/${followId}`,
        "PUT",
        {},
        {
          Authorization: `Bearer ${currentUser.token.accessToken}`,
        }
      );
      //redirect user to the landing page
    } catch (err) {}
  };
  return (
    <button
      className={`btn--profile-cta ${following ? "btn-following" : ""}`}
      onClick={handleFollow}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
};

import React, { useState, useEffect, useContext } from "react";
import ErrorModal from "../../components/Modal/ErrorModal";
import useHttpClient from "../../hooks/useHttpClient";
import PostList from "../PostList/PostList";
import { AuthContext } from "../../context/auth";
const Posts = ({ cover, followedPost }) => {
  const [loadedPosts, setLoadedPosts] = useState([]);
  const { isLoading, sendReq, error, clearError } = useHttpClient();
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const responseData = await sendReq(
          `${process.env.REACT_APP_BASE_URL}/post`
        );
        setLoadedPosts(responseData);
      } catch (err) {}
    };
    const fetchFollowedPosts = async () => {
      try {
        const responseData = await sendReq(
          `${process.env.REACT_APP_BASE_URL}/post/followed`,
          "GET",
          null,
          {
            Authorization: `Bearer ${currentUser.token.accessToken}`,
          }
        );
        setLoadedPosts(responseData);
      } catch (err) {}
    };
    followedPost ? fetchFollowedPosts() : fetchPosts();
  }, [sendReq, followedPost]);

  return (
    <>
      <ErrorModal error={error} onClose={clearError} />
      {loadedPosts && (
        <PostList isLoading={isLoading} items={loadedPosts} cover={cover} />
      )}
    </>
  );
};

export default Posts;

import React, { useState, useEffect, useContext } from "react";
import Posts from "../../components/Post/Posts";
import RightSideBar from "../../components/RightSideBar/RightSideBar";
import LeftSideBar from "../../components/LeftSideBar/LeftSideBar";
import useHttpClient from "../../hooks/useHttpClient";
import { AuthContext } from "../../context/auth";
import Related from "../../components/Related/Related";

const Home = () => {
  const [tags, setTags] = useState([]);
  const { sendReq, isLoading } = useHttpClient();
  const { isLoggedIn } = useContext(AuthContext);
  const [followedPost, setFollowedPost] = useState(false);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const responseData = await sendReq(
          `${process.env.REACT_APP_BASE_URL}/tag/home`
        );
        setTags(responseData);
      } catch (err) {}
    };
    fetchPosts();
  }, [sendReq]);

  return (
    <div className="container-layout">
      <div className="container-sidebar">
        <LeftSideBar />
      </div>
      <div>
        {isLoggedIn ? (
          <>
            <Related setFollowedPost={setFollowedPost} />
            <Posts followedPost={followedPost} cover={true} />
          </>
        ) : (
          <Posts followedPost={false} cover={true} />
        )}
      </div>
      <RightSideBar tags={tags} isLoading={isLoading} />
    </div>
  );
};

export default Home;

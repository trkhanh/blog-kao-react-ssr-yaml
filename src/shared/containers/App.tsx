import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { About, NoMatch, Sidebar } from "../components";
import * as Components from "../components";
import { withSlug, withTag } from "../hocs";

const App: React.FC = () => {
  const PostOr404 = withSlug(Components.PostOr404);
  const Posts = withTag(Components.Posts);
  return (
    <>
      <Route element={<Sidebar />} />
      <div id="content">
        <Routes>
          <Route element={<Posts />} />
          <Route path="about" element={<About />} />
          <Route path="posts">
            <Route element={<Posts />} />
            <Route path=":slug" element={<PostOr404 />} />
          </Route>
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </div>
    </>
  );
};

export default App;

import * as React from "react";
import { Context } from "shared/containers";
import { RequestError } from "shared/http";
import Date from "./Date";
import Error from "./Error";
import NoMatch from "./NoMatch";
import PaginationLink from "./PaginationLink";
import Spinner from "./Spinner";
import Tags from "./Tags";
import { get } from "shared/http";

const Post: React.FC<Post> = (props: Post) => {
  const { title, body, created, tags, wordCount, previous, next } = props;
  return (
    <>
      <div className="post">
        <h1>{title}</h1>
        <p className="meta">
          <Date timestamp={created} />
          {" · "}
          <Tags tags={tags} />
          {" · "}
          {wordCount} {wordCount !== 1 ? " words" : " word"}
        </p>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </div>
      <div className="pagination">
        <PaginationLink next={previous}>Previous</PaginationLink>
        <PaginationLink next={next}>Next</PaginationLink>
      </div>
    </>
  );
};

type Props = {
  slug: string;
  post?: Post;
};

type State = {
  post: Post;
  loading: boolean;
  error: RequestError;
};

class PostOr404 extends React.Component<Props, State> {
  private controller: AbortController;
  constructor(props: Props) {
    super(props);

    let post;
    if (__isBrowser__) {
      post = window.__INITIAL_DATA__ as Post;
      delete window.__INITIAL_DATA__;
    } else {
      post = props.post;
    }

    this.state = {
      post,
      error: null,
      loading: false,
    };

    this.fetchPost = this.fetchPost.bind(this);
  }

  public componentDidMount(): void {
    this.controller = new AbortController();
    if (!this.state.post) {
      const { slug } = this.props;
      this.fetchPost(slug);
    }
  }

  public componentDidUpdate(prevProps: Props): void {
    const { slug } = this.props;
    if (prevProps.slug !== slug) {
      this.fetchPost(slug);
    }
  }

  public render(): React.ReactElement {
    const { post, error, loading } = this.state;
    if (error && error.status === 404) {
      return <NoMatch />;
    }
    if (error) {
      return (
        <Error>
          There was an error fetching the post. Please try again later.
        </Error>
      );
    }
    if (loading || post == null) {
      return <Spinner />;
    }
    return <Post {...post} />;
  }

  public componentWillUnmount(): void {
    this.controller.abort();
  }

  private fetchPost(slug: string): void {
    const url = `/api/posts/${slug}`;
    this.setState({ loading: true }, () =>
      get<Post>(url, this.controller.signal)
        .then((post) => this.setState({ post, loading: false }))
        .catch((error) => {
          if (error.name !== "AbortError") {
            this.setState({ error, loading: false });
          }
        })
    );
  }
}

const Wrapped: React.FC<Props> = (props: Props) => {
  const post = React.useContext(Context.Post);
  return <PostOr404 {...props} post={post} />;
};

export default Wrapped;

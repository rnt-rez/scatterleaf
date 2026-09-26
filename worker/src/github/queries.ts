export const REPO_DISCOVERY_QUERY = `
  query RepoDiscovery($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      id
      nameWithOwner
      discussionCategories(first: 25) {
        nodes {
          id
          name
          slug
          isAnswerable
        }
      }
    }
  }
`;

export const FIND_DISCUSSION_QUERY = `
  query FindDiscussion($owner: String!, $name: String!, $categoryId: ID, $term: String!) {
    repository(owner: $owner, name: $name) {
      id
      discussions(first: 1, categoryId: $categoryId, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          id
          number
          title
          url
          createdAt
          comments(first: 50) {
            totalCount
            nodes {
              id
              body
              bodyHTML
              createdAt
              updatedAt
              author {
                login
                avatarUrl
                url
              }
              reactionGroups {
                content
                reactors {
                  totalCount
                }
                viewerHasReacted
              }
              replies(first: 30) {
                totalCount
                nodes {
                  id
                  body
                  bodyHTML
                  createdAt
                  updatedAt
                  author {
                    login
                    avatarUrl
                    url
                  }
                  reactionGroups {
                    content
                    reactors {
                      totalCount
                    }
                    viewerHasReacted
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_DISCUSSION_BY_TITLE_QUERY = `
  query SearchDiscussion($searchQuery: String!) {
    search(query: $searchQuery, type: DISCUSSION, first: 1) {
      nodes {
        ... on Discussion {
          id
          number
          title
          url
          createdAt
          comments(first: 50) {
            totalCount
            nodes {
              id
              body
              bodyHTML
              createdAt
              updatedAt
              author {
                login
                avatarUrl
                url
              }
              reactionGroups {
                content
                reactors {
                  totalCount
                }
                viewerHasReacted
              }
              replies(first: 30) {
                totalCount
                nodes {
                  id
                  body
                  bodyHTML
                  createdAt
                  updatedAt
                  author {
                    login
                    avatarUrl
                    url
                  }
                  reactionGroups {
                    content
                    reactors {
                      totalCount
                    }
                    viewerHasReacted
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_DISCUSSION_MUTATION = `
  mutation CreateDiscussion($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: { repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body }) {
      discussion {
        id
        number
        url
        title
      }
    }
  }
`;

export const ADD_DISCUSSION_COMMENT_MUTATION = `
  mutation AddComment($discussionId: ID!, $body: String!, $replyToId: ID) {
    addDiscussionComment(input: { discussionId: $discussionId, body: $body, replyToId: $replyToId }) {
      comment {
        id
        body
        bodyHTML
        createdAt
        author {
          login
          avatarUrl
          url
        }
      }
    }
  }
`;

export const UPDATE_DISCUSSION_COMMENT_MUTATION = `
  mutation UpdateComment($commentId: ID!, $body: String!) {
    updateDiscussionComment(input: { commentId: $commentId, body: $body }) {
      comment {
        id
        body
        bodyHTML
        updatedAt
      }
    }
  }
`;

export const DELETE_DISCUSSION_COMMENT_MUTATION = `
  mutation DeleteComment($id: ID!) {
    deleteDiscussionComment(input: { id: $id }) {
      clientMutationId
    }
  }
`;

export const ADD_REACTION_MUTATION = `
  mutation AddReaction($subjectId: ID!, $content: ReactionContent!) {
    addReaction(input: { subjectId: $subjectId, content: $content }) {
      reaction {
        content
      }
      subject {
        id
      }
    }
  }
`;

export const REMOVE_REACTION_MUTATION = `
  mutation RemoveReaction($subjectId: ID!, $content: ReactionContent!) {
    removeReaction(input: { subjectId: $subjectId, content: $content }) {
      reaction {
        content
      }
      subject {
        id
      }
    }
  }
`;

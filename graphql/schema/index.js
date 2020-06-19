//allows us to define a schema for our API
const { gql } = require("apollo-server-express")

//! means doesnt accept null values 
//user password is nullable because we don't want to return a password when we get user data 
//custom definitions should match how they appear in the database - TODO 
//RootQuery and RootMutation is where our resolvers get pointed to; to be defined in resolvers > index.js
//TODO: user authentication 
const schema = gql`
    type AuthenticatedUser {
        token: String!
        username: String!
        userId: String!
        darkType: Boolean
    }
    type User {
        _id: ID!
        username: String!
        password: String
        email: String
        points: Int
        isMod: Boolean
        darkType: Boolean
        numPosts: Int
        posts: [Post]
        replies: [Reply]
        pointsByCategory: [PointsByCategory]
        postsByCategory: [PostsByCategory]
    }
    type Category {
        _id: ID!
        name: String!
        description: String! 
        subcategories: [Subcategory!]
    }
    type Subcategory {
        _id: ID! 
        name: String!
        description: String! 
        category: Category! 
        posts: [Post!]
    }
    type Post {
        _id: ID!
        date_created: String
        title: String!
        body: String
        is_locked: Boolean!
        points: Int       
        subcategory: Subcategory!
        category: Category! 
        author: User!
        replies: [Reply!]
    }
    type Reply {
        _id: ID!
        date_created: String!
        body: String!
        post: Post!
        author: User!
        points: Int
        category: Category
    }
    type PointsByCategory {
        _id: ID!
        category: Category! 
        user: User!
        points: Int 
    }
    type PostsByCategory {
        _id: ID
        category: Category
        user: User
        posts: Int
    }

    input Credentials {
        username: String 
        password: String
    }
    input PostInput {
        date_created: String
        title: String
        body: String
        is_locked: Boolean
        points: Int
        subcategoryId: String
        categoryId: String 
        authorId: String
        sortRepliesByPoints:Boolean
    }
    input UserInput {
        username: String
        password: String
        email: String
        points: Int
        isMod: Boolean
        darkType: Boolean
    }
    input ReplyInput {
        date_created: String
        body: String
        postId: String
        categoryId: String 
        authorId: String
        points: Int
    }
    input CategoryInput {
        name: String
        description: String
        sortByPosts: Boolean
    }
    input SubcategoryInput {
        name: String
        description: String 
        categoryId: String 
    }
    

    type RootQuery {
        posts(postInput: PostInput): [Post!]!
        users(sortByPosts: Boolean,sortByPoints: Boolean,userInput: UserInput): [User!]!   
        currentUser(token: String): User 
        replies(postId: ID!): [Reply]    
        categories(categoryInput: CategoryInput): [Category!]!
        category(id: ID!): Category 
        subcategory(id: ID!): Subcategory
        subcategories: [Subcategory!]!
        post(id: ID!): Post
        user(id: ID!): User
        pointsByCategoryByUser(userId: ID!, categoryId: ID!): PointsByCategory
        pointsByCategory(categoryId: ID!): [PointsByCategory]
        postsByCategoryByUser(userId: ID!,categoryId: ID!): PostsByCategory
        postsByCategory(categoryId: ID!): [PostsByCategory]
        postsByUser(userId: ID!): [PostsByCategory]
    }
    
    type RootMutation {
        createPost(postInput: PostInput): Post
        createUser(userInput: UserInput): User
        authenticate(credentials: Credentials!): AuthenticatedUser
        createAcc(credentials: Credentials): AuthenticatedUser!
        login(username: String!, password: String!): User
        createCategory(categoryInput: CategoryInput): Category
        createReply(replyInput: ReplyInput): Reply 
        updatePost(id: ID!, postInput: PostInput): Post 
        updateUser(id: ID!, userInput: UserInput): User 
        updateCategory(id: ID!, categoryInput: CategoryInput): Category
        updateReply(id: ID!, replyInput: ReplyInput): Reply
        deleteReply(id: ID!): Post! 
        createSubcategory(subcategoryInput: SubcategoryInput): Subcategory 
        updateSubcategory(id: ID!, subcategoryInput: SubcategoryInput): Subcategory
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }`


//export api schema 
module.exports = schema; 
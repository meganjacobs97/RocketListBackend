//allows us to define a schema for our API
const { buildSchema } = require("graphql"); 

//! means doesnt accept null values 
//user password is nullable because we don't want to return a password when we get user data 
//custom definitions should match how they appear in the database - TODO 
//RootQuery and RootMutation is where our resolvers get pointed to; to be defined in resolvers > index.js
//TODO: user authentication 
const schema = buildSchema(`
    type User {
        _id: ID!
        username: String!
        password: String
        email: String!
        points: Int
        posts: [Post]
        replies: [Reply]
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
        post: [Post!]
    }
    type Post {
        _id: ID!
        date_created: String
        title: String!
        body: String
        is_locked: Boolean!
        points: Int
        subcategory: Subcategory!
        author: User!
        replies: [Reply!]
    }
    type Reply {
        _id: ID!
        date_created: String!
        body: String!
        post: Post!
        author: User!
    }
    type PointsByCategory {
        _id: ID!
        category: Category! 
        user: User!
        points: Int 
    }
    type AuthData {
        userId: ID!
        token: String!
        tokenExpiration: Int!
    }




    input PostInput {
        date_created: String
        title: String
        body: String
        is_locked: Boolean
        points: Int
        subcategoryId: String
        authorId: String
    }
    input UserInput {
        username: String
        password: String
        email: String
        points: Int
    }
    input ReplyInput {
        date_created: String
        body: String
        postId: String
        authorId: String
    }
    input CategoryInput {
        name: String
        description: String
    }
    input SubcategoryInput {
        name: String
        description: String 
        categoryId: String 
    }
    input PointsByCategoryInput {
        points: Int
        categoryId: String 
        userId: String 
    }

    

    type RootQuery {
        posts: [Post!]!
        users: [User!]!        
        categories: [Category!]!
        category(id: ID!): Category 
        subcategory(id: ID!): Subcategory
        subcategories: [Subcategory!]!
        post(id: ID!): Post
        user(id: ID!): User
        pointsByCategoryByUser(userId: ID!, categoryId: ID!): PointsByCategory
        allPointsByUser(userId: ID!): Int
        pointsByCategory(categoryId: ID!): [PointsByCategory]
    }
    
    type RootMutation {
        createPost(postInput: PostInput): Post
        createUser(userInput: UserInput): User
        createCategory(categoryInput: CategoryInput): Category
        createReply(replyInput: ReplyInput): Reply 
        updatePost(id: ID!, postInput: PostInput): Post 
        updateUser(id: ID!, userInput: UserInput): User 
        updateCategory(id: ID!, categoryInput: CategoryInput): Category
        updateReply(id: ID!, replyInput: ReplyInput): Reply
        deleteReply(id: ID!): Post! 
        createSubcategory(subcategoryInput: SubcategoryInput): Subcategory 
        updateSubcategory(id: ID!, subcategoryInput: SubcategoryInput): Subcategory
        updatePointsByCategory(userId: ID!,categoryId: ID!,pointsByCategoryInput: PointsByCategoryInput): PointsByCategory 
        createPointsByCategory(pointsByCategoryInput: PointsByCategoryInput): PointsByCategory
        
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }`
)

//export api schema 
module.exports = schema; 
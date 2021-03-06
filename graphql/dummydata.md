1. Go to http://localhost:3001/api
2. Run the following queries to create users: 

`mutation {
    createUser(userInput: {
        username: "rory"
        password: "password"
        email: "rory@test.com"
    }) {
        _id
        username
        email
    }
}`

`mutation {
    createUser(userInput: {
        username: "dion"
        password: "password"
        email: "dion@test.com"
        isMod: true
    }) {
        _id
        username
        email
    }
}`

`mutation {
    createUser(userInput: {
        username: "paul"
        password: "password"
        email: "paul@test.com"
        isMod: true
    }) {
        _id
        username
        email
    }
}`

`mutation {
    createUser(userInput: {
        username: "louis"
        password: "password"
        email: "louis@test.com"
        isMod: true
    }) {
        _id
        username
        email
    }
}`

3. Run the following queries to create categories: 

`mutation {
    createCategory(categoryInput: {
        name: "Video Games"
        description: "For questions involving games of the video sort."
  }) {
        _id
        name
        description
  }
}`

`mutation {
    createCategory(categoryInput: {
        name: "DIY"
        description: "For Do-It-Yourself projects."
  }) {
        _id
        name
        description
  }
}`

4. Run this query to grab the appropriate category IDs: 

`query {
    categories {
	    _id
    	name
    	description
  }
}`

5. Run these queries, inserting the appropriate category IDs: 

`mutation {
    createSubcategory(subcategoryInput: {
    	name: "WoW"
        description: "World of Warcraft related questions go here"
    	categoryId: "[INSERT CATEGORY ID]"
    }) {
        _id
        name
        description
        category {
            _id
            name
            description
        }
    }
}`

`mutation {
    createSubcategory(subcategoryInput: {
    	name: "Minecraft"
        description: "Everyone's favorite"
    	categoryId: "[INSERT CATEGORY ID]"
    }) {
        _id
        name
        description
        category {
            _id
            name
            description
        }
    }
}`

`mutation {
    createSubcategory(subcategoryInput: {
    	name: "Misc"
        description: "General video games category"
    	categoryId: "[INSERT CATEGORY ID]"
    }) {
        _id
        name
        description
        category {
            _id
            name
            description
        }
    }
}`

`mutation {
    createSubcategory(subcategoryInput: {
    	name: "Misc"
        description: "General DIY category"
    	categoryId: "[INSERT CATEGORY ID]"
    }) {
        _id
        name
        description
        category {
            _id
            name
            description
        }
    }
}`

6. Run the following query to grab user IDs: 

`query {
    users {
	    _id
  	    username
   	    email
    }
}`

7. Run the following query to grab subcategory IDs: 

`query {
    subcategories {
        _id
        name
        description
        category {
            name
            _id
        }
    }
}`

8. Create some posts: 

`mutation {
  createPost(postInput: {
    	title: "is herobrine real?"
        body: "I haven't played minecraft since 2012"
    	subcategoryId: "[SUBCATEGORY ID]"
        categoryId: "[CATEGORYID]"
    	authorId: "[USER ID]"
  }) {
        _id
        title
        body
  }
}`

`mutation {
  createPost(postInput: {
    	title: "xbox vs playstation?"
        body: "which one should I buy?"
    	subcategoryId: "[SUBCATEGORY ID]"
        categoryId: "[CATEGORYID]"
    	authorId: "[USER ID]"
  }) {
        _id
        title
        body
  }
}`

`mutation {
  createPost(postInput: {
    	title: "are video games real"
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    	subcategoryId: "[SUBCATEGORY ID]"
        categoryId: "[CATEGORYID]"
    	authorId: "[USER ID]"
  }) {
        _id
        title
        body
  }
}`

9. Run the following query to grab post IDs: 

`query {
  posts {
    _id
    title
    author {
      username
    }
    category {
      name
      _id
    }
  }
}`

10. Run the following queries to create replies: 

`mutation {
  createReply(replyInput: {
    	body: "video games are games are not real"
    	postId: "[POST ID]"
        categoryId: "[CATEGORYID]"
    	authorId: "[AUTHOR ID]"
    }) {
        _id
        body
        post {
            title
            body
        }
        author {
            username
        }
    }
}`

`mutation {
  createReply(replyInput: {
    	body: "yes"
    	postId: [POST ID]
        categoryId: "[CATEGORYID]"
    	authorId: [AUTHOR ID]
  }) {
    _id
    body
    post {
      title
      body
    }
    author {
      username
    }
  }
}`

`mutation {
  createReply(replyInput: {
    	body: "what is herobrine?"
    	postId: "[POST ID]"
        categoryId: "[CATEGORYID]"
    	authorId: "[AUTHOR ID]"
  }) {
    _id
    body
    post {
      title
      body
    }
    author {
      username
    }
  }
}`

`mutation {
  createReply(replyInput: {
    	body: "pc is where it's at"
    	postId: "[POST ID]"
        categoryId: "[CATEGORYID]"
    	authorId: "[AUTHOR ID]"
  }) {
    _id
    body
    post {
      title
      body
    }
    author {
      username
    }
  }
}`

11. Query for category IDs & post IDs

`query {
    categories {
        name 
        _id
        subcategories {
            posts {
                title
                _id
            }
        }
    }
}`

12. Give some points to posts (automatically updates user's points as well)

a) Paired Queries: 

`mutation {
    updatePost(id: "[POST ID]",postInput: {
        points: 2
    }) {
        title
  	    points
    }
}`

`mutation {
    updatePost(id: "[POST ID]",postInput: {
        points: 10
    }) {
        title
  	    points
    }
}`

13. Query for reply IDs & Category IDs

query {
   posts {
    title
    subcategory {
      category {
        _id
      }  
    }
    replies {
      body
      _id
    }
  }
}

14. Give some points to replies (user points are automatically updated as well)

`mutation {
    updateReply(id:"[REPLY ID]", replyInput: {
        points: 1
  }) {
  	_id
    author {
        username
        }
    body
    points
  }
}`
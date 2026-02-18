## Structuring the Business Logic for the API Routes

### GET: /api/v1/news/category
**Purpose**: Should return the application-defined categories and subcategories data. Built for the initial ui display to select from.
**State**:  Finished
**Tested**: True

### GET: /api/v1/news/category/me
**Purpose**: Should return the categories/subcategories selected by the user including the custom ones.
**State**: Finished
**Tested**: False

### GET: /api/v1/news/today
**Purpose**: Should return the today news.
**State**: Finished
**Tested**: True
**Extention Plans**:
- Adding Query parameters for the news cutoff(not only latest news)
- Allowing to get the news from specific source (openai/anthropic/google/hackernoon)
  etc.


### POST: /api/v1/news/category
**Purpose**: Should set the categories/subcategories of the user.
**State**: Finished
**Tested**: False

### PUT: /api/v1/news/category
**Purpose**: Should update the user categories/subcategories
**State**: Finished
**Tested**: False


### POST: /api/v1/news/category/custom
**Purpose**: Should create the custom category defined by the user.
**State**: Finished
**Tested**: False
**Implementation Plan**: 
- Should check for the existence of the category (includes db check and VectorDB check too.)
- If exists: Return the existing category to subscribe/select
  if not exists: Create new category.


### POST: /api/v1/news/subcategory/custom
**Purpose**: Should create the custom subcategory on the given category.
**State**: Finished
**Tested**: False
**Implementation Plan**: 
- Should check for the existence of the subcategory (includes db check and VectorDB check too.)
- If exists: Return the existing subcategory to subscribe/select for the user.
  if not exists: Create new subcategory.



## Extenstion Plans
- Creating the API for the user to search for the categories and subcategories
  created by other user. Will align with the creation of custom categories and subcategories.

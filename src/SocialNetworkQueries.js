export class SocialNetworkQueries {
  constructor({ fetchCurrentUser }) {
    this.fetchCurrentUser = fetchCurrentUser;
    this.lastFetchedUser = null;
  }

  // Returns a list of books that are liked by at least 50% of the current user's friends.
  async findPotentialLikes(minimalScore) {

    try {

      // Fetch current user which is done by the injected dependency.
      const user = await this.fetchCurrentUser();

      this.lastFetchedUser = user;

    } catch (error) {

      // If fetch fails and there is no last fetched user, return empty list.
      if (this.lastFetchedUser === null) return [];
    }

    // Destructure likes and friends from user object.
    const { likes: userLikes, friends } = this.lastFetchedUser;

    // If user has no friends, return empty list.
    if (!friends) return [];

    // Create a new object to track how many friends like each book.
    const bookLikes = {};
    
    friends.forEach((friend) => {
      // If friend has no likes, skip.
      if (!friend.likes) return;

      // Create a Set Object to track unique books liked by this friend
      const uniqueBooks = new Set(friend.likes);
      uniqueBooks.forEach((book) => {
        if (!bookLikes[book]) bookLikes[book] = 0;
        bookLikes[book]++;
      });
    });

    /*
     * Filter out books that are already liked by the user and
     * sort the remaining books by the number of friends that like them.
     * If two books have the same number of likes, sort them alphabetically.
     * Finally, return result.
     */
    const potentialLikes = Object.entries(bookLikes)
      .filter(
        ([book, count]) =>
          !userLikes.includes(book) && count / friends.length >= minimalScore
      )
      .sort((a, b) => {
        if (b[1] === a[1]) return a[0].localeCompare(b[0]);
        return b[1] - a[1];
      })
      .map(([book]) => book);

    return potentialLikes;
  }
}

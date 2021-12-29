# Match best flat mate in Airtable

Team from the IE business school that I am mentoring is doing a service to find the perfect room-mate based on the answers in their questionnaire.

We needed to find the best match in terms of score based on then answers.

It is possible to represent a profile as a multidimensional vector and later create a beautiful radar chart from it.

I love working with vectors ever since I studied Matlab, but I have never been able to compare such things inside Airtable before.

The first iteration was manual (so that the team could work out a hypothesis based on the data they get and only then start automation).

I added Scripting App Block, which used js library to find the nearest vector and wrote a simple algorithm to search and filter all records, fetching user parameters from corresponding strings.

Ask me questions about airtable in this telegram community: https://t.me/airtablelikeapro

Closest Vector library: https://github.com/meodai/ClosestVector

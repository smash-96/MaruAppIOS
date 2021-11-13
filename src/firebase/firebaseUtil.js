import { auth, db } from "./firebaseConfig";

export const copyDoc = async (
  collectionFrom,
  docId,
  collectionTo,
  addData,
  newDocId,
  recursive = false
) => {
  // document reference
  const docRef = db.collection(collectionFrom).doc(docId);

  // copy the document
  const docData = await docRef
    .get()
    .then((doc) => doc.exists && doc.data())
    .catch((error) => {
      console.error(
        "Error reading document",
        `${collectionFrom}/${docId}`,
        JSON.stringify(error)
      );
      // throw new functions.https.HttpsError(
      //   "not-found",
      //   "Copying document was not read"
      // );
    });

  if (docData) {
    // document exists, create the new item
    await db
      .collection(collectionTo)
      .doc(newDocId)
      .set({ ...docData, ...addData })
      .catch((error) => {
        console.error(
          "Error creating document",
          `${collectionTo}/${newDocId}`,
          JSON.stringify(error)
        );
        // throw new functions.https.HttpsError(
        //   "data-loss",
        //   "Data was not copied properly to the target collection, please try again."
        // );
      });

    // if copying of the subcollections is needed
    if (recursive) {
      // subcollections
      const subcollections = await docRef.listCollections();
      for await (const subcollectionRef of subcollections) {
        const subcollectionPath = `${collectionFrom}/${docId}/${subcollectionRef.id}`;

        // get all the documents in the collection
        return await subcollectionRef
          .get()
          .then(async (snapshot) => {
            const docs = snapshot.docs;
            for await (const doc of docs) {
              await copyDoc(
                subcollectionPath,
                doc.id,
                `${collectionTo}/${docId}/${subcollectionRef.id}`,
                true
              );
            }
            return true;
          })
          .catch((error) => {
            console.error(
              "Error reading subcollection",
              subcollectionPath,
              JSON.stringify(error)
            );
            // throw new functions.https.HttpsError(
            //   "data-loss",
            //   "Data was not copied properly to the target collection, please try again."
            // );
          });
      }
    }
    return true;
  }
  return false;
};

export const deleteDoc = async (docPath) => {
  // document reference
  const docRef = db.doc(docPath);

  // // subcollections
  // const subcollections = await docRef.listCollections();
  // for await (const subcollectionRef of subcollections) {
  //   await subcollectionRef
  //     .get()
  //     .then(async (snapshot) => {
  //       const docs = snapshot.docs;
  //       for await (const doc of docs) {
  //         await deleteDoc(`${docPath}/${subcollectionRef.id}/${doc.id}`);
  //       }
  //       return true;
  //     })
  //     .catch((error) => {
  //       console.error(
  //         "Error reading subcollection",
  //         `${docPath}/${subcollectionRef.id}`,
  //         JSON.stringify(error)
  //       );
  //       return false;
  //     });
  // }

  // when all subcollections are deleted, delete the document itself
  return docRef
    .delete()
    .then(() => true)
    .catch((error) => {
      console.error("Error deleting document", docPath, JSON.stringify(error));
      return false;
    });
};

export const moveDoc = async (
  collectionFrom,
  docId,
  collectionTo,
  addData,
  newDocId,
  recursive = false
) => {
  // copy the organisation document
  const copied = await copyDoc(
    collectionFrom,
    docId,
    collectionTo,
    addData,
    newDocId,
    recursive
  );

  // if copy was successful, delete the original
  if (copied) {
    await deleteDoc(`${collectionFrom}/${docId}`);
    return true;
  }
  // throw new functions.https.HttpsError(
  //   "data-loss",
  //   "Data was not copied properly to the target collection, please try again."
  // );
};

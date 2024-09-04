import { User } from '../app.entity';

function informStructureDeletion(userEmail: string): Promise<void> {
  const secondsToWait = Math.trunc(Math.random() * 7) + 1;

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log(userEmail, 'informed!');
      resolve();
    }, secondsToWait * 1000);
  });
}

function splitArrayIntoMultipleArray(
  itemsArray: any[],
  maxItems: number = 10,
): any[][] {
  const batches = [];
  for (let i = 0; i < itemsArray.length; i += maxItems) {
    const batch = itemsArray.slice(i, i + maxItems);
    batches.push(batch);
  }
  return batches;
}

export function sendEmailToUsers(
  users: User[],
  options: { batchSize: number },
): void {
  const batches = splitArrayIntoMultipleArray(users, options.batchSize);
  for (const users of batches) {
    for (const user of users) informStructureDeletion(user.email);
  }
}

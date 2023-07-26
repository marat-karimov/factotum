export function renderEmptyState() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 239.32 254.65"><defs><style>.cls-1{fill:#313335;}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M165.36,254.65c-6.16-.7-8.51-4.17-8.1-10.26.29-4.26-1-6.85-6.4-7.58-12.19-1.65-20.49-8.93-24.37-20.67s-1.23-22.28,7.14-31.24c2.06-2.2,2.31-3.77,1.05-6.42-7.76-16.31-15.28-32.72-23-49A49.71,49.71,0,0,0,96.8,110.62C66.92,87.7,37.35,64.39,7.67,41.22,5.84,39.79,4,38.32,2.2,36.9c-.84-.65-1.59-1.43-1-2.49.9-1.6,2-.45,2.92.06s2,1.19,3,1.79Q42.37,57.69,77.65,79.12c1.43.87,2.73,2.24,4.94,2.17-.47-.94-.72-1.55-1.06-2.11Q59.32,42.65,37.08,6.13C36.3,4.86,35.6,3.54,34.8,2.28c-.54-.86-.47-1.46.47-1.95C35.89,0,36.46-.24,37,.41c.74.9,1.47,1.8,2.18,2.71Q76.86,51.35,114.53,99.6a22.85,22.85,0,0,0,6.58,5.91c19.09,11.1,39.73,19,59.43,28.8,2.5,1.25,3.5-.09,5-1.49,8.07-7.56,17.65-10.47,28.43-8.07,17.27,3.83,28,21.21,23.65,37.85-4.44,17.09-22,27.5-38.44,22.82-17.46-4.95-27.09-22.52-21.58-39.8.9-2.83.45-4-2.13-5.37-14.4-7.77-30.61-9.43-46-13.84-2.25-.64-2.59.35-2.06,2.29,4.26,15.43,6.07,31.57,13.81,46,1.5,2.8,2.73,2.83,5.33,2,12-3.82,22.78-1.18,31.58,7.61,16,16,10.52,42.21-10.44,50.93-2.54,1-3.89,1.93-3,5,1.41,4.75,2.45,9.61,3.64,14.43ZM156,182.93a23.4,23.4,0,1,0,.2,46.79,23.4,23.4,0,0,0-.2-46.79Zm27.89-27.67c.11,12.94,10.72,23.52,23.41,23.36a23.37,23.37,0,1,0-.14-46.74A23.21,23.21,0,0,0,183.88,155.26Zm-73.12-51c-3.56,0-5.54,2.22-5.66,5.54a5.31,5.31,0,0,0,5.34,5.89c3.63.2,5.76-1.85,6.21-5.64C116.34,106.47,114.5,104.26,110.76,104.23Z"/><path class="cls-1" d="M115.61,149.55c-4.13-10.44-8.18-20.23-14.2-29-3.8-5.52-5.85-5.54-10.59-.8L3.6,207c-4.83,4.84-4.82,7.24.17,11.9a50.08,50.08,0,0,0,26.34,13c7.84,1.33,14-.93,18.18-8,5-8.4,9.23-17.22,13.44-26,6.29-13.18,12.78-26.31,22.4-37.39C92.21,151.14,100.9,142,115.61,149.55Z"/><path class="cls-1" d="M133.93,133.23q9.38,9.22,18.76,18.44c1.2,1.18,2.65,2.63,4.24,1.13s.17-3-1-4.19c-4.43-4.47-8.91-8.89-13.34-13.37C140.28,132.91,137.18,133.14,133.93,133.23Z"/><path class="cls-1" d="M135.93,145.07c1.44,6,2.45,10.76,3.79,15.47,1,3.53,4.09,4,6.8,2.86,3.31-1.36,2.7-4.37,1-6.66C144.56,152.63,140.82,149.17,135.93,145.07Z"/><path class="cls-1" d="M150.37,136.82c3.69,3.48,6.52,6.19,9.4,8.85,1.1,1,2.34,2.11,3.8.58s.14-2.68-.76-3.82C160,138.91,156.55,136.75,150.37,136.82Z"/><path class="cls-1" d="M235,62.93q-18.42-18.55-37-37c-5.13-5.12-8.26-5.14-13.46.05q-32.94,32.88-65.87,65.79c-2.12,2.1-2.48,3.5-.35,5.65,3.6,3.63,7.23,7.08,12.7,7.56a3.51,3.51,0,0,1,2.07,1.15c3.12,3.54,7.63,4.48,11.56,6.52l1-1c-3-2.81-6.07-5.58-9-8.42-1-1-2.41-1.86-.69-3.62s2.63-1.21,4,.22c5.69,5.81,11.59,11.42,17.19,17.32,3.45,3.63,8,4.85,12.82,6.1-8.83-8.71-17.61-17.47-26.53-26.09-2-1.94-2.46-3.47.14-5,1.88-1.06,2.62.93,3.55,1.86q14.68,14.53,29.25,29.18c.71.71,1.38,1.45,2.12,2.1,1.32,1.17,2.77,3.21,4.54,1.29s-.28-3.3-1.53-4.56c-10.32-10.34-20.68-20.63-30.95-31-1.16-1.17-3.87-2.16-1.37-4.67s3.49.13,4.7,1.32c10,9.93,20,19.93,30,29.9.94.94,1.89,1.86,2.91,2.71a1.89,1.89,0,0,0,2.69.06,2,2,0,0,0,.16-3.07c-.95-1.15-2-2.21-3.07-3.26-9.86-9.86-19.74-19.69-29.55-29.6-1.16-1.17-3.81-2.14-1.2-4.62s3.47.24,4.65,1.4c9.09,9,18.1,18,27.13,27.07,1.18,1.18,2.31,2.4,3.54,3.5,1.39,1.24,2.8,3.82,4.86,1.9s-.34-3.55-1.64-4.86c-5.93-6-11.95-12-17.94-18Q169.72,84.18,163,77.48c-1.09-1.1-2.8-2-.92-4s3.09-.63,4.41.7q15.12,15.15,30.26,30.29a37.44,37.44,0,0,0,3.33,3,2,2,0,0,0,2.81-2.64,26.3,26.3,0,0,0-2.6-3Q185,86.45,169.74,71.13c-1.18-1.18-3.16-2.07-1-4.31s3.13-.22,4.29.93Q188.43,83,203.74,98.34a22.28,22.28,0,0,0,3,2.63,1.91,1.91,0,0,0,2.65-.52,1.72,1.72,0,0,0,.06-2.28,28.3,28.3,0,0,0-2.61-3c-10-10-20-19.93-29.89-30-1.24-1.26-4.36-2.33-1.5-5,2.52-2.36,3.5.38,4.7,1.56l1.54,1.53,3.2-3.21c-.53-.54-1.08-1.07-1.61-1.62-1.16-1.18-3.92-2.14-1.49-4.66,2.69-2.81,3.74.27,5,1.51,9.93,9.79,19.75,19.68,29.61,29.53.7.71,1.39,1.44,2.12,2.11,1.15,1,2.41,2.09,3.83.54s0-2.7-.9-3.81c-.53-.63-1.16-1.18-1.75-1.77-10-10-20-19.9-29.9-29.94-1.15-1.17-3.84-2.17-1.4-4.72s3.49.15,4.64,1.29c9.92,9.8,19.75,19.69,29.6,29.55.82.83,1.62,1.67,2.48,2.45,1,.94,2.32,1.7,3.53.6,1.5-1.36.54-2.74-.55-3.84-4.31-4.38-8.65-8.71-13-13.06-6.33-6.33-12.7-12.64-19-19-.83-.84-2.64-1.49-1.69-3.12.72-1.24,2.38-1.27,3.61-1.21,2.65.12,4.48,1.87,6.27,3.67,8.19,8.24,16.36,16.5,24.68,24.61,2.48,2.42,5.58,6.51,9.08,2.89C241.36,68.63,237.54,65.46,235,62.93Z"/></g></g></svg>';
  const emptyState = `
    <div id="empty-state-container">
      <div id="empty-state">${svg}</div>
    </div>`;
  document.getElementById("table-container").innerHTML = emptyState;
}
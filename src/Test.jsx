export default function Test() {
  // AI가 생성해줄 HTML 코드가 이 변수에 들어갑니다.

  return (
    <div>
      {/* // dangerouslySetInnerHTML을 사용해야 HTML 태그가 먹힙니다. //{' '} */}
      {/* <div dangerouslySetInnerHTML={{ __html: testhtml }} /> */}
    </div>
  );
}

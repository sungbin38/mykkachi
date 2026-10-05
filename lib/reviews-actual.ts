import type { ReviewStory } from "./reviews";

// Verbatim supplied conversation, with names and companies masked.
export const actualConversation = {
  id: 31,
  title: "세 곳의 이직 제안, 어디로 가는 게 맞을까요?",
  topic: "이직 · 커리어",
  clientName: "민*",
  kind: "actual",
  theme: "classic",
  messages: [
    { role: "client", text: "지금 이직 때문에 고민하고 있는 회사가 총 3군데인데요. [A사]랑 [B사]라는 뷰티 브랜드, 그리고 [C사]라는 뷰티 플랫폼이에요. 그중에서도 [A사]랑 [C사] 사이에서 고민이 많이 돼요.", preview: true },
    { role: "client", text: "[A사]는 대표님이 지인이고 친한 친구도 이미 다니고 있어요. 회사가 성장도 잘하고 영업이익도 잘 나오는 편이라, 상대적으로 안정적이고 편하게 적응할 수 있을 것 같아요. 다만 대표님과 직접 일하기보다는 새로 부임한 C-level 분과 주로 일하게 될 것 같고요." },
    { role: "client", text: "[C사]는 회사를 인수한 PE 쪽에서 먼저 연락을 주셨어요. 그쪽에 제가 예전부터 꼭 한번 같이 일해보고 싶었던 분이 계시기도 하고, [C사] 대표님도 업계에서 워낙 유명한 분이라 함께 일하면서 배우고 싶은 마음이 커요." },
    { role: "client", text: "다만 이야기를 들어보니 제가 맡게 될 신규 비즈니스 모델 자체가 꽤 어렵고 빡셀 것 같아서 고민이 되는군요." },
    { role: "client", text: "사주로 지금 시기에 어떤 환경이나 방향을 선택하는 게 저한테 더 잘 맞는지도 나오나요?" },
    { role: "teacher", text: "근데 커리어적으로는 지금 엄청 좋은 흐름이 들어 온 건 맞아서 사실 [C사] 가실 것 같은 느낌? 이거 참고하시면 좋을 거 같은데 민*님한테는 노란색이 커리어+이성운 인데 27년부터 쭉 노란색 있어서 잘 될 거 같아요. 근데 2031년부터는 잠깐 힘든 시기 올 수도 있어요 검은색 수 기운을 조심하시면 됩니다.", time: "오전 9:30", preview: true },
    { role: "teacher", text: "참고로 본부장님이 수 기운이에요", time: "오전 9:33" },
    { role: "client", text: "사주보는 개발자분... 너무 소중 사발자이시네여..........", time: "오전 10:27", preview: true },
    { role: "client", text: "오호 그렇군요(!) 수기운 과다라서 오호", time: "오전 10:28" },
  ],
} satisfies ReviewStory;

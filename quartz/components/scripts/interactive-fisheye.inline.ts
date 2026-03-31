import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

document.addEventListener("nav", () => {
  const canvas = document.getElementById('fisheye-playground') as HTMLCanvasElement;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rawText = "우리가 80년을 건강하게 산다고 생각하면 약 3만 일을 사는 셈인데, 우리 직관이 다루기엔 제법 큰 수입니다. 저는 대략 그 절반을 지나 보냈고, 여러분 대부분은 약 3분의 1을 지나 보냈습니다. 혹시 그중 며칠을 기억하고 있는지 세어 본 적 있으신가요? 쉼 없이 들이쉬고 내쉬는 우리가 오랫동안 잡고 있을 날들은 3만의 아주 일부입니다. 먼 옛날의 나와, 지금 여기의 나와, 먼 훗날의 나라는 3명의 완벽히 낯선 사람들을 이런 날들이 엉성하게 이어 주고 있습니다. 마무리 짓고 새롭게 시작하는 오늘 졸업식이 그런 날 중 하나일 수 있겠다는 생각이 듭니다. 그런 하루를 여러분과 공유할 수 있어서 무척 기쁩니다. \n \n  학위수여식에 참석할 때 감수해야 할 위험 중 하나가 졸업 축사가 아닌가 합니다. 우연과 의지와 기질이 기막히게 정렬돼서 크게 성공한 사람의 교묘하거나 진부한 자기 자랑을 듣고 말 확률이 있기 때문입니다. 저는 겁이 나서, 아니면 충실하게 지내지 못한 대학생활이 부끄러워서 15년 전 이 자리에 오지 못했습니다만, 여러분은 축하받을 만한 일을 축하받기 위해 이를 무릅쓰고 이곳에 왔습니다. 졸업식 축사에서는 어떤 이야기를 하면 좋을까요? 십몇 년 후의 내가 되어 자신에게 해줄 축사를 미리 떠올려 보는 것도, 그 사람에게 듣고 싶은 축사를 지금 떠올려 보는 것도 가치 있지 않을까 싶습니다. 생각해 보세요. 당연하게 떠오르는 말은 없습니다. 지난 몇천 일, 혹은 다가올 몇천 일간의 온갖 기대와 실망, 친절과 부조리, 행운과 불행, 그새 무섭도록 반복적인 일상의 세부 사항은 말하기에도, 듣기에도 힘들거니와 격려와 축하라는 본래의 목적에도 어울리지 않을 것입니다. 구체화한 마음은 부적절하거나 초라합니다. \n \n  제 대학생활은 잘 포장해서 이야기해도 길 잃음의 연속이었습니다. 똑똑하면서 건강하고 성실하기까지 한 주위 수많은 친구를 보면서 나 같은 사람은 뭘 하며 살아야 하나 고민했습니다. 잘 쉬고 돌아오라던 어느 은사님의 말씀이, 듬성듬성해진 성적표 위에서 아직도 저를 쳐다보고 있는 듯합니다. \n 지금 듣고 계신 분들도 정도의 차이와 방향의 다름이 있을지언정 지난 몇 년간 본질적으로 비슷한 과정을 거쳤으리라 생각합니다. 그리고 이제 더 큰 도전, 불확실하고, 불투명하고, 끝은 있지만 잘 보이진 않는 매일의 반복을 눈앞에 두고 있습니다. 생각보다 힘들 수도 있고, 생각만큼 힘들 수도 있습니다. \n \n  이제 본격적으로 어른입니다. 실패를 두려워하지 말고 도전하라. 편안하고 안전한 길을 거부하라. 타협하지 말고 자기의 진짜 꿈을 좇아라. 모두 좋은 조언이고 사회의 입장에서는 특히나 유용한 말입니다만, 개인의 입장은 다를 수 있음을 여러분은 이미 고민해 봤습니다. 제로섬 상대평가의 몇 가지 퉁명스러운 기준을 따른다면, 일부만이 예외적으로 성공할 것입니다. 여러 변덕스러운 우연이, 그리고 지쳐버린 타인이, 그리고 누구보다 자신이 자신에게 모질게 굴 수 있으니 마음 단단히 먹기 바랍니다. 나는 커서 어떻게 살까, 오래된 질문을 오늘부터의 매일이 대답해줍니다. \n \n 취업 준비, 결혼 준비, 육아, 교육, 승진, 은퇴, 노후 준비를 거쳐 어디 병원 그럴듯한 1인실에서 사망하기 위한 준비에 산만해지지 않기를 바랍니다. 무례와 혐오와 경쟁과 분열과 비교와 나태와 허무의 달콤함에 길들지 않길, 의미와 무의미의 온갖 폭력을 이겨내고 하루하루를 온전히 경험하길, 그 끝에서 오래 기다리고 있는 낯선 나를 아무 아쉬움 없이 맞이하게 되길 바랍니다. \n \n 오래전의 제가 졸업식에 왔다면 무슨 이야기를 해줘야 할까 고민했습니다만 생각을 잘 매듭짓지 못했습니다. 그가 경험하게 될 날들이 안쓰럽기도 하고 가슴 먹먹하게 부럽기도 합니다. 여러분은 자신에게 선물할 어떤 축사를 떠올리셨을지 궁금합니다. 수학은 무모순이 용납하는 어떤 정의도 허락합니다. 수학자들 주요 업무가 그중 무엇을 쓸지 선택하는 것인데, 언어를 어떻게 사용할 것인가에 대한 가능한 여러 가지 약속 중 무엇이 가장 아름다운 구조를 끌어내는지가 그 가치의 잣대가 됩니다. 오늘같이 특별한 날 특별한 곳에서 특별한 사람들과 함께하니 들뜬 마음에 모든 시도가 소중해 보입니다. 타인을 내가 아직 기억하지 못하는 먼 미래의 자신으로, 자신을 잠시지만 지금 여기서 온전히 함께하고 있는 타인으로 받아들일 수 있을지 궁금해집니다. \n \n 졸업생 여러분, 오래 준비한 완성을 축하하고, 오늘의 새로운 시작을 축하합니다. 서로에게, 그리고 자신에게 친절하시길, 그리고 그 친절을 먼 미래의 우리에게 잘 전달해 주시길 바랍니다. 응원합니다. 축하합니다. 감사합니다.";


  const baseFontSize = 14;
  const lineHeight = 30;
  const fontFamily = '"Pretendard", "Helvetica Neue", sans-serif';
  const fontStr = `${baseFontSize}px ${fontFamily}`;

  // 캔버스 크기를 부모 요소에 맞춰 동적으로 설정하되, 내용의 길이를 반영하도록 함
  function resizeCanvas(contentHeight: number = 350) {
    const dpr = window.devicePixelRatio || 1;
    
    // 캔버스 너비를 우측 사이드바 침범하지 않게 최대 850px로 타협
    const width = Math.min(850, window.innerWidth - 40);
    
    const height = Math.max(350, contentHeight + 100);
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx!.scale(dpr, dpr);
    return { width, height };
  }
  
  // 먼저 레이아웃을 계산하기 위해 임시로 너비만 정의 (최대 850px로 타협)
  const tempWidth = Math.min(850, window.innerWidth - 40);
  
  // \n을 강제 줄바꿈으로 인식하도록 옵션 추가 (whiteSpace: 'pre-wrap')
  const prepared = prepareWithSegments(rawText, fontStr, { whiteSpace: 'pre-wrap' });
  const { lines } = layoutWithLines(prepared, tempWidth - 40, lineHeight);
  
  // 계산된 줄 수에 따라 전체 높이 도출 및 캔버스 크기 최종 할당
  const computedHeight = lines.length * lineHeight;
  let { width: canvasWidth, height: canvasHeight } = resizeCanvas(computedHeight);

  // 글자들을 개별 객체로 분리하여 저장 (한 번만 계산)
  interface CharData {
    char: string;
    baseX: number;
    baseY: number;
    width: number;
    x: number;
    y: number;
    size: number;
    color: string;
  }

  let chars: CharData[] = [];
  
  // マ우스 반응 범위를 조금 좁혀서 너무 정신없지 않게 조절
  let mouse = { x: -1000, y: -1000, radius: 70 };
  let animationFrameId: number;

  const onMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  };

  const onMouseLeave = () => {
    mouse.x = -1000;
    mouse.y = -1000;
  };

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);

  window.addCleanup(() => {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    cancelAnimationFrame(animationFrameId);
  });

  function animate() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      
      // 마우스와 글자 사이의 거리 계산
      const dx = mouse.x - c.baseX;
      const dy = mouse.y - c.baseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Fisheye (어안) 효과 로직
      // 마우스에 가까울수록 글자가 커지고 (돋보기), 마우스 밖으로 살짝 밀려남 (유체)
      if (distance < mouse.radius) {
        // 거리 비율에 따른 효과 강도 (0 ~ 1, 가까울수록 1)
        const force = (mouse.radius - distance) / mouse.radius;
        
        // 크기 증가 (최대 원래 크기의 2배로 축소)
        const targetSize = baseFontSize + (force * baseFontSize * 1.0);
        c.size += (targetSize - c.size) * 0.2;

        // 위치 이동 (밀려나는 최대 거리를 12px로 축소)
        const angle = Math.atan2(dy, dx);
        const pushDistance = force * 12; 
        const targetX = c.baseX - Math.cos(angle) * pushDistance;
        const targetY = c.baseY - Math.sin(angle) * pushDistance;
        
        c.x += (targetX - c.x) * 0.2;
        c.y += (targetY - c.y) * 0.2;

        // 다크모드/라이트모드를 고려해 푸른 물결빛 적용
        c.color = `rgb(${80 - force * 60}, ${120 + force * 80}, ${180 + force * 75})`;
      } else {
        // 마우스 범위 밖이면 원래 상태로 복귀
        c.size += (baseFontSize - c.size) * 0.1;
        c.x += (c.baseX - c.x) * 0.1;
        c.y += (c.baseY - c.y) * 0.1;
        // Quartz 기본 글자색상 적용
        const isDark = document.documentElement.getAttribute("saved-theme") === "dark";
        c.color = isDark ? '#e0e0e0' : '#1a1a1a'; 
      }

      // 글자 그리기
      ctx!.font = `${c.size}px ${fontFamily}`;
      ctx!.fillStyle = c.color;
      ctx!.fillText(c.char, c.x, c.y);
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  // 창 크기 변경 시 레이아웃 초기화
  const onResize = () => {
    cancelAnimationFrame(animationFrameId);
    
    // 새 너비로 줄바꿈 다시 계산 (여백 고려 및 pre-wrap 설정) - 850px 허용
    const newWidth = Math.min(850, window.innerWidth - 40);
    const rePrepared = prepareWithSegments(rawText, fontStr, { whiteSpace: 'pre-wrap' });
    const newLayout = layoutWithLines(rePrepared, newWidth - 40, lineHeight);
    
    const computedHeight = newLayout.lines.length * lineHeight;
    
    // 캔버스 크기 재계산 (길어진 텍스트만큼 높이 확보)
    let { width, height } = resizeCanvas(computedHeight);
    
    // 글자 배열 초기화 및 재할당
    chars = [];
    ctx!.font = fontStr;
    
    // 위아래 여백을 50px로 두고 시작
    let yPos = 50; 
    
    for (let i = 0; i < newLayout.lines.length; i++) {
      const lineText = newLayout.lines[i].text;
      // pre-wrap에 의해 빈 줄(\n)이 있으면 lineText가 빈 문자열일 수 있습니다.
      if (!lineText) continue;

      const lineWidth = ctx!.measureText(lineText).width;
      
      // 왼쪽 정렬 느낌을 살리면서 중앙에 박스를 맞추기 
      // (완전 중앙 정렬보다 긴 글에 가독성이 좋습니다)
      let currentX = (width - (newWidth - 40)) / 2;
      
      for (const char of lineText) {
        const charWidth = ctx!.measureText(char).width;
        chars.push({
          char,
          baseX: currentX,
          baseY: yPos + i * lineHeight,
          width: charWidth,
          x: currentX,
          y: yPos + i * lineHeight,
          size: baseFontSize,
          color: 'var(--dark)'
        });
        currentX += charWidth;
      }
    }
    animate();
  };

  window.addEventListener('resize', onResize);
  
  // 첫 로드 시 레이아웃 계산을 위해 트리거
  onResize();
  
  window.addCleanup(() => {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(animationFrameId);
  });
})

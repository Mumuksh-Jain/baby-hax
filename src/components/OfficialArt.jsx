import React, { useId } from 'react';

// Vector display masks follow the supplied silhouettes. Source PNGs stay unmodified.
export function OfficialLantern({ className = '' }) {
  const id = useId().replaceAll(':', '');
  return <svg viewBox="0 0 1024 914" className={className} role="img" aria-label="Pip's official dream lantern">
    <defs><clipPath id={id}>
      <path clipRule="evenodd" d="M580 231A71 71 0 1 1 438 231A71 71 0 1 1 580 231ZM567 231A58 58 0 1 0 451 231A58 58 0 1 0 567 231Z" />
      <path d="M407 330 Q406 306 466 285 Q471 246 509 246 Q548 246 554 285 Q615 305 614 331 C654 362 679 393 683 447 L696 464 L703 506 L695 535 L698 634 Q736 672 725 707 Q737 767 663 789 Q509 818 363 783 Q288 768 293 713 Q291 680 317 661 L314 550 Q304 528 313 506 L327 491 L331 432 Q341 368 407 330 Z" />
    </clipPath></defs>
    <image href="/assets/optimized/pip/pip_dream_lantern.webp" width="1024" height="914" clipPath={`url(#${id})`} />
  </svg>;
}

export function OfficialPip({ className = '' }) {
  const id = useId().replaceAll(':', '');
  return <svg viewBox="0 0 896 1090" className={className} role="img" aria-label="Pip, the little dream engineer, seated on a cloud">
    <defs><clipPath id={id}><path d="M236 383 Q202 353 173 375 Q130 407 159 453 Q177 482 210 470 Q220 524 285 565 L288 651 Q241 670 247 704 Q184 711 175 756 Q155 803 182 855 Q200 891 242 891 Q271 933 316 915 Q351 934 402 923 Q464 919 482 909 Q535 927 567 902 Q622 904 640 869 Q693 857 695 815 Q746 790 729 743 Q725 703 676 693 L619 657 L600 598 Q628 580 651 550 Q692 549 685 516 Q680 495 663 498 Q667 470 644 466 Q632 465 623 481 Q622 457 601 469 L580 490 L568 470 Q639 395 601 303 Q619 264 564 210 Q463 132 351 165 Q278 177 248 232 Q211 241 216 270 Q189 274 202 300 Q198 323 219 331 Z" /></clipPath></defs>
    <image href="/assets/optimized/pip/pip_avatar_cloud.webp" width="896" height="1090" clipPath={`url(#${id})`} />
  </svg>;
}

/* Edit this file to update project metadata, videos, and reported results.
 * Paths are relative to index.html. Leave src empty until a video is available.
 * All numbers below come from paper/sec/experiments.tex (September 2026 draft).
 */
window.AUTOAGENT = {
  project: {
    authors: 'Anonymous Authors',
    paper: '',
    code: '',
    arxiv: '',
    citation: `@misc{autoagent0,
  title = {AutoAgent0: An Agentic Runtime for Safe Closed-loop Driving},
  author = {Anonymous Authors},
  note = {Research manuscript; publication metadata pending}
}`
  },
  overview: { src: 'assets/videos/overview.mp4', poster: 'assets/figures/video-overview.webp', title: 'AutoAgent0: from failure to verified recovery', filename: 'overview.mp4', captions: 'assets/videos/overview-en.vtt', posterIsVideoFrame: true },
  scenarios: [
    { id: 'construction-permutations', label: 'Construction variants', title: 'Adapting to unfamiliar construction layouts', description: 'Changes in obstacle arrangement test generalization. Recovery primitives expose continuous parameters that can be revised using verifier feedback.', videos: { expert: '', monitor: '', ours: '' } },
    { id: 'custom-obstacles', label: 'Novel obstacles', title: 'Accounting for objects the expert may miss', description: 'Complementary camera, LiDAR, and semantic checks refine the scene evidence used to evaluate proposed trajectories around unusual obstacles.', videos: { expert: '', monitor: '', ours: '' } },
    { id: 'animals', label: 'Animals', title: 'Responding to unusual road interactions', description: 'Animal scenarios are one of the long-tail families in the evaluation stress set. The runtime reassesses proposals against the latest detected scene.', videos: { expert: '', monitor: '', ours: '' } },
    { id: 'pedestrian-crowds', label: 'Pedestrian crowds', title: 'Maintaining verification as the scene changes', description: 'Dense pedestrian interactions require repeated scene assessment. A revised recovery trajectory must pass the same admission criteria before it replaces the current plan.', videos: { expert: '', monitor: '', ours: '' } }
  ],
  methodVideos: [
    { id: 'perception', title: 'Scene context refinement', detail: 'Camera + LiDAR + semantic validation. Excerpt from the overview.', src: 'assets/videos/scene-refinement.mp4', poster: 'assets/figures/video-perception.webp', filename: 'scene-refinement.mp4', posterIsVideoFrame: true },
    { id: 'recovery', title: 'Verifier-guided recovery', detail: 'Select → parameterize → verify. Excerpt from the overview.', src: 'assets/videos/recovery-planning.mp4', poster: 'assets/figures/video-recovery.webp', filename: 'recovery-planning.mp4', posterIsVideoFrame: true },
    { id: 'adaptation', title: 'Closed-loop adaptation', detail: 'Observe, revise, and verify again. Excerpt from the overview.', src: 'assets/videos/closed-loop-adaptation.mp4', poster: 'assets/figures/video-adaptation.webp', filename: 'closed-loop-adaptation.mp4', posterIsVideoFrame: true }
  ],
  // Metrics in each split: driving score, success rate (%), harmonic mean.
  results: [
    { name: 'TCP', input: 'RGB', id: [24.7,39.1,30.3], gen: [24.5,31.4,27.5], avg: [24.6,35.3,28.9] },
    { name: 'Orion', input: 'RGB', id: [53.0,52.0,52.5], gen: [51.2,46.0,48.5], avg: [52.1,49.0,50.5] },
    { name: 'HiP-AD', input: 'RGB', id: [74.1,70.7,72.4], gen: [67.1,56.7,61.5], avg: [70.6,63.7,67.0] },
    { name: 'SimLingo', input: 'RGB', id: [82.6,79.3,80.9], gen: [71.7,55.0,62.2], avg: [77.2,67.2,71.6] },
    { name: 'AlignDrive', input: 'RGB', id: [74.7,75.7,75.2], gen: [68.6,62.7,65.5], avg: [71.7,69.2,70.4] },
    { name: 'BevAD', input: 'RGB', id: [87.4,83.3,85.3], gen: [82.3,68.7,74.9], avg: [84.9,76.0,80.1] },
    { name: 'TF++', input: 'RGB + LiDAR', id: [83.3,78.5,80.8], gen: [75.4,61.1,67.5], avg: [79.4,69.8,74.2] },
    { name: 'TFv6', input: 'RGB + LiDAR', id: [90.2,93.3,91.7], gen: [79.5,70.7,74.8], avg: [84.9,82.0,83.3] },
    { name: 'UniAD', input: 'RGB', id: [47.5,36.3,41.2], gen: [44.0,27.6,33.9], avg: [45.8,32.0,37.6], expert: true },
    { name: 'UniAD + AutoAgent0', input: 'RGB + LiDAR', id: [68.4,69.0,68.7], gen: [69.2,69.0,69.1], avg: [68.8,69.0,68.9], ours: true },
    { name: 'SparseDriveV2', input: 'RGB + LiDAR', id: [70.0,74.0,71.9], gen: [62.9,52.7,57.4], avg: [66.5,63.4,64.7], expert: true },
    { name: 'SparseDriveV2 + AutoAgent0', input: 'RGB + LiDAR', id: [80.7,85.7,83.1], gen: [79.2,81.0,80.1], avg: [80.0,83.4,81.7], ours: true },
    { name: 'BridgeDrive', input: 'RGB + LiDAR', id: [91.6,95.0,93.3], gen: [81.9,75.0,78.3], avg: [86.8,85.0,85.8], expert: true },
    { name: 'BridgeDrive + AutoAgent0', input: 'RGB + LiDAR', id: [91.7,95.3,93.5], gen: [85.7,85.3,85.5], avg: [88.7,90.3,89.5], ours: true }
  ],
  navsafe: [
    ['PDM-Closed*',90.17,81.29,305.27,82.49,88.97,71.62,84.24,57.78],
    ['LTF',53.04,27.71,163.71,97.81,31.81,24.81,28.35,15.56],
    ['DiffusionDrive',44.77,20.96,165.08,97.68,21.27,11.86,23.65,22.22],
    ['DrivoR',64.74,50.69,188.02,87.92,58.61,31.38,52.53,43.33],
    ['SparseDriveV2',65.26,48.78,167.99,93.41,53.55,43.46,48.32,41.67],
    ['+ AutoAgent0',null,null,null,null,null,null,null,null],
    ['ReCogDrive–2B–IL†',48.98,28.28,166.94,97.58,30.03,17.18,31.16,26.67],
    ['MTDrive–SFT†',48.78,31.79,173.77,94.51,30.40,15.20,35.65,44.44]
  ]
};

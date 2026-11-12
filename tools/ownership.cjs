function matches(file, pattern) {
  const special = '\\^$.*+?()[]{}|';
  const escape = value => [...value].map(char => special.includes(char) ? '\\' + char : char).join('');
  const expression = pattern.split('**').map(part => part.split('*').map(escape).join('[^/]*')).join('.*');
  return new RegExp('^' + expression + '$').test(file.replaceAll('\\', '/'));
}

function ownerOf(config, file) {
  const exact = config.members.find(member => member.paths.includes(file));
  if (exact) return exact;
  const candidates = config.members.flatMap(member => member.paths.filter(pattern => matches(file, pattern)).map(pattern => ({member,weight:pattern.replaceAll('*','').length})));
  candidates.sort((a,b) => b.weight - a.weight);
  return candidates[0]?.member;
}

function classify(config, memberId, file) {
  const owner = ownerOf(config,file);
  if (owner?.id === memberId) return {type:'owned',owner};
  if (config.sharedPaths.some(pattern => matches(file,pattern))) return {type:'shared',owner};
  return {type:'coordinate',owner};
}
module.exports = { matches, ownerOf, classify };


export function Card({ className = '', ...props }) {
  return <div className={`card-surface ${className} overflow-hidden`} {...props} />;
}
export function CardHeader({ className = '', ...props }) {
  return <div className={`p-4 border-b border-gray-100 ${className}`} {...props} />;
}
export function CardContent({ className = '', ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}
export function CardFooter({ className = '', ...props }) {
  return <div className={`p-4 border-t border-gray-100 ${className}`} {...props} />;
}

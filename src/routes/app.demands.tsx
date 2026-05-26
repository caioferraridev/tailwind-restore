import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/demands')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/demands"!</div>
}
